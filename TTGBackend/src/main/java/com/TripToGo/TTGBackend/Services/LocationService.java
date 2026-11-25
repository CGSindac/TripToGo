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
import org.springframework.jdbc.core.JdbcTemplate;
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
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewLocationRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewRepository.LocationRatings;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewTagRepository;

@Service
@Transactional(readOnly = true)
public class LocationService {
    private static final int PAGE_SIZE = 20;
    private static final int LOCATION_LOCK_NAMESPACE = "review location".hashCode();

    private final ReviewLocationRepository locations;
    private final ReviewRepository reviews;
    private final ReviewTagRepository tags;
    private final JdbcTemplate jdbc;

    public LocationService(ReviewLocationRepository locations, ReviewRepository reviews,
            ReviewTagRepository tags, JdbcTemplate jdbc) {
        this.locations = locations;
        this.reviews = reviews;
        this.tags = tags;
        this.jdbc = jdbc;
    }

    public Page<LocationResponseDTO> browse(String search, String tag, int page) {
        if (page < 0 || page > Integer.MAX_VALUE / PAGE_SIZE) {
            throw badRequest("Invalid page number.");
        }
        String name = line(search, "search", 255, false);
        String code = line(tag, "tag", 4, false);
        PageRequest paging = PageRequest.of(page, PAGE_SIZE, Sort.by("locName", "locationId"));
        Page<Location> matches = code.isEmpty()
                ? locations.findByLocNameContainingIgnoreCase(name, paging)
                : locations.findDistinctByLocNameContainingIgnoreCaseAndTags_Code(name, code, paging);
        if (matches.isEmpty()) {
            return matches.map(location -> toResponse(location, null));
        }
        Map<Integer, LocationRatings> ratings = reviews.averageLocationRatings(
                matches.map(Location::getLocationID).getContent(), ReviewStatus.VERIFIED).stream()
                .collect(Collectors.toMap(LocationRatings::getLocationId, Function.identity()));
        return matches.map(location -> toResponse(location, ratings.get(location.getLocationID())));
    }

    public LocationResponseDTO get(int locationId) {
        return toResponse(locations.findById(locationId).orElseThrow(LocationService::notFound));
    }

    @Transactional
    public LocationResponseDTO save(Integer locationId, LocationRequestDTO request) {
        if (request.address() == null) {
            throw badRequest("An address is required.");
        }
        String name = line(request.name(), "name", 255, true);
        Address address = new Address(
                line(request.address().country(), "country", 25, true),
                line(request.address().province(), "province", 255, true),
                line(request.address().city(), "city", 255, true),
                line(request.address().barangay(), "barangay", 255, true));
        String description = request.description() == null ? "" : request.description().strip();
        if (description.length() > 2000 || description.indexOf(0) >= 0) {
            throw badRequest("Description must contain at most 2000 valid characters.");
        }
        String key = String.join("\n", name, address.country(), address.province(), address.city(), address.barangay());
        lockLocationIdentity(key.toLowerCase(Locale.ROOT));
        Location location = locationId == null ? new Location() : lockLocation(locationId);
        boolean duplicate = locations.findMatchingLocations(
                name, address.country(), address.province(), address.city(), address.barangay()).stream()
                .anyMatch(match -> !match.getLocationID().equals(locationId));
        if (duplicate) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This location is already listed.");
        }
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

    @Transactional
    public void delete(int locationId) {
        Location location = lockLocation(locationId);
        if (reviews.existsByLocation_LocationId(locationId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This location has reviews and cannot be deleted.");
        }
        locations.delete(location);
    }

    void lockLocationIdentity(String key) {
        jdbc.queryForObject("select 1 from pg_advisory_xact_lock(?, ?)", Integer.class,
                LOCATION_LOCK_NAMESPACE, key.hashCode());
    }

    private Location lockLocation(int locationId) {
        return locations.findForUpdate(locationId).orElseThrow(LocationService::notFound);
    }

    private Set<Tag> resolveTags(List<String> codes) {
        Set<String> requested = codes.stream().map(code -> line(code, "tagCode", 4, true))
                .collect(Collectors.toSet());
        List<Tag> selected = tags.findAllById(requested);
        if (selected.size() != requested.size()) {
            throw badRequest("One or more tag codes are unknown.");
        }
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
