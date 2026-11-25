package com.TripToGo.TTGBackend.Services;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.LocationDTOs.LocationRequestDTO;
import com.TripToGo.TTGBackend.DTOs.LocationDTOs.LocationRequestDTO.Address;
import com.TripToGo.TTGBackend.DTOs.LocationDTOs.LocationResponseDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewOptionsDTO.TagOption;
import com.TripToGo.TTGBackend.Models.Location;
import com.TripToGo.TTGBackend.Models.ReviewStatus;
import com.TripToGo.TTGBackend.Models.Tag;
import com.TripToGo.TTGBackend.Repositories.LocationRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewLocationRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewRepository.LocationRatings;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewTagRepository;

@Service
@Transactional(readOnly = true)
public class LocationService {
    private static final int PAGE_SIZE = 20;

    private final ReviewLocationRepository locations;
    private final ReviewRepository reviews;
    private final ReviewTagRepository tags;
    private final LocationRepository locationRepository;

    public LocationService(ReviewLocationRepository locations, ReviewRepository reviews,
            ReviewTagRepository tags, LocationRepository locationRepository) {
        this.locations = locations;
        this.reviews = reviews;
        this.tags = tags;
        this.locationRepository = locationRepository;
    }

    /**
     * 
     * @param search refers to a location's name, will be used to find locations with the same attribure ('name')
     * @param tagCodes refers to a location's tag/s; works in conjunction with search 
     * @param page refers to the pagination of the response
     * @return Returns a Page Object containing locations 
     */

    public Page<LocationResponseDTO> browse(String search, List<String> tagCodes, int page) {
        if (page < 0 || page > Integer.MAX_VALUE / PAGE_SIZE) throw badRequest("Invalid page number.");
    

        String name = line(search, "search", 255, false);
        List<String> codes = tagCodes == null ? List.of()
                : tagCodes.stream()
                        .map(code -> line(code, "tag", 4, false))
                        .filter(code -> !code.isEmpty())
                        .distinct()
                        .toList();
        PageRequest paging = PageRequest.of(page, PAGE_SIZE, Sort.by("locName", "locationId"));

        Page<Location> matches = codes.isEmpty()
                ? locations.findByLocNameContainingIgnoreCase(name, paging)
                : locations.findDistinctByLocNameContainingIgnoreCaseAndTags_CodeIn(name, codes, paging);


        if (matches.isEmpty())  return matches.map(location -> toResponse(location, null));
        
        // Caluclates the rating during runtime
        Map<Integer, LocationRatings> ratings = reviews.averageLocationRatings(
                matches.map(Location::getLocationID).getContent(), ReviewStatus.VERIFIED).stream()
                .collect(Collectors.toMap(LocationRatings::getLocationId, Function.identity()));

        return matches.map(location -> toResponse(location, ratings.get(location.getLocationID())));
    }

    public LocationResponseDTO get(int locationId) {
        return toResponse(locations.findById(locationId).orElseThrow(LocationService::notFound));
    }

    /**
     * 
     * Uploads a new location to the database
     * 
     * @param locationId always null as a id is automatically generated upon insertion to the table
     * @param request refers to a locationRequestDTO from the request body sent by the client 
     * @return  returns the uploaded Location value as a LocationResponseDTO
     */
    @Transactional
    public LocationResponseDTO save(Integer locationId, LocationRequestDTO request) {
        if (request.address() == null) throw badRequest("An address is required.");
        
        String name = line(request.name(), "name", 255, true);

        Address address = new Address(
                line(request.address().country(), "country", 25, true),
                line(request.address().province(), "province", 255, true),
                line(request.address().city(), "city", 255, true),
                line(request.address().barangay(), "barangay", 255, true));

        String description = request.description() == null ? "" : request.description().strip();

        if (description.length() > 2000 || description.indexOf(0) >= 0) throw badRequest("Description must contain at most 2000 valid characters.");
        

        String key = String.join("\n", name, address.country(), address.province(), address.city(), address.barangay());
        lockLocationIdentity(key.toLowerCase(Locale.ROOT));


        Location location = locationId == null ? new Location() : lockLocation(locationId);

        // Checks if the inserted ocation already exists
        boolean duplicate = locations.findMatchingLocations(
                name, address.country(), address.province(), address.city(), address.barangay()).stream()
                .anyMatch(match -> !match.getLocationID().equals(locationId));

        if (duplicate) throw new ResponseStatusException(HttpStatus.CONFLICT, "This location is already listed.");

        location.setName(name);
        location.setCountry(address.country());
        location.setProvince(address.province());
        location.setCity(address.city());
        location.setBarangay(address.barangay());
        location.setDescription(description.isEmpty() ? null : description);

        if (request.tagCodes() != null) {
            location.setTags(resolveTags(request.tagCodes()));
        }
        
        return toResponse(locations.save(location));
    }

    /**
     * 
     * @param locationId refers to the given ID of a location in the database
     *  
     * Does not delete the location if it has 1 or more reviews 
     * 
     */
    @Transactional
    public void delete(int locationId) {
        Location location = lockLocation(locationId);
        if (reviews.existsByLocation_LocationId(locationId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This location has reviews and cannot be deleted.");
        }
        locations.delete(location);
    }

    // === UTILITIES === //
    /**
     * 
     * @param key system's key to acces transaction-level advisory lock
     * 
     *  Prevents race conditons such as simultaneous read & writes
     */
    void lockLocationIdentity(String key) {
        locationRepository.lockLocationIdentity(key);
    }

    /**
     * 
     * @param locationId refer's to a location's ID in the database
     * @return Returns the location matched with the Id parameter; Return HTTP Not found when no such locations are found
     */
    private Location lockLocation(int locationId) {
        return locations.findForUpdate(locationId).orElseThrow(LocationService::notFound);
    }

    /**
     *  Checks if the each tag in a given list can be found in the database's tags table
     * 
     * @param codes List of tag codes 
     * @return returns a hash set of the passed tags if checks passed; Throws bad request if it fails
     */
    private Set<Tag> resolveTags(List<String> codes) {
        Set<String> requested = codes.stream().map(code -> line(code, "tagCode", 4, true))
                .collect(Collectors.toSet());

        List<Tag> selected = tags.findAllById(requested);

        if (selected.size() != requested.size()) throw badRequest("One or more tag codes are unknown.");
        
        return new HashSet<>(selected);
    }

    private LocationResponseDTO toResponse(Location location) {
        List<LocationRatings> ratings = reviews.averageLocationRatings(
                List.of(location.getLocationID()), ReviewStatus.VERIFIED);
        return toResponse(location, ratings.stream().findFirst().orElse(null));
    }

    private static LocationResponseDTO toResponse(Location location, LocationRatings ratings) {
        List<TagOption> options = location.getTags().stream()
                .sorted(Comparator.comparing(Tag::getName).thenComparing(Tag::getCode))
                .map(tag -> new TagOption(tag.getCode().strip(), tag.getName(), tag.getDescription()))
                .toList();
        Address address = new Address(location.getCountry(), location.getProvince(),
                location.getCity(), location.getBarangay());
        double enjoyment = ratings == null ? location.getEnjoymentRating() : ratings.getEnjoymentRating();
        double budget = ratings == null ? location.getBudgetRating() : ratings.getBudgetRating();
        return new LocationResponseDTO(location.getLocationID(), location.getLocName(),
                address, location.getDescription(), options, enjoyment, budget);
    }

    /**
     *  Cleans and Normalizes the passed string
     * @param value
     * @param field
     * @param maxLength
     * @param required
     * @return Returns a cleaned String
     */
    private static String line(String value, String field, int maxLength, boolean required) {
        String cleaned = value == null ? "" : Normalizer.normalize(value, Normalizer.Form.NFKC)
                .replaceAll("(?U)\\s+", " ").strip();
        if ((required && cleaned.isEmpty()) || cleaned.length() > maxLength
                || cleaned.codePoints().anyMatch(Character::isISOControl)) {
            throw badRequest(field + " must contain " + (required ? "1 to " : "at most ")
                    + maxLength + " valid characters.");
        }
        return cleaned;
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Location was not found.");
    }
}
