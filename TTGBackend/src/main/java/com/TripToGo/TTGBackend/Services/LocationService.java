package com.TripToGo.TTGBackend.Services;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.LocationRequestDTO;
import com.TripToGo.TTGBackend.DTOs.LocationResponseDTO;
import com.TripToGo.TTGBackend.DTOs.PageQueryDTO;
import com.TripToGo.TTGBackend.DTOs.PageResponseDTO;
import com.TripToGo.TTGBackend.DTOs.RecommendationRequestDTO;
import com.TripToGo.TTGBackend.DTOs.RecommendationResponseDTO;
import com.TripToGo.TTGBackend.DTOs.TagResponseDTO;
import com.TripToGo.TTGBackend.Models.Location;
import com.TripToGo.TTGBackend.Models.Tag;
import com.TripToGo.TTGBackend.Repositories.LocationRepository;
import com.TripToGo.TTGBackend.Repositories.TagRepository;

@Service
@Transactional(readOnly = true)
public class LocationService {

    private static final PageRequest RECOMMENDATION_LIMIT = PageRequest.of(0, 20,
            Sort.by(Sort.Order.desc("enjoymentRating"), Sort.Order.asc("locationId")));

    private final LocationRepository locationRepository;
    private final TagRepository tagRepository;
    private final UserService userService;

    public LocationService(LocationRepository locationRepository, TagRepository tagRepository, UserService userService) {
        this.locationRepository = locationRepository;
        this.tagRepository = tagRepository;
        this.userService = userService;
    }

    public PageResponseDTO<LocationResponseDTO> listLocations(String search, String tagCode, PageQueryDTO page) {
        String query = search.strip();
        String code = tagCode.strip();
        if (query.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "q must have at most 100 characters");
        }
        if (!code.isEmpty() && code.length() != 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tagCode must have four characters");
        }

        PageRequest pageRequest = PageRequest.of(page.page(), page.size(), Sort.by("locationId"));
        return PageResponseDTO.from(locationRepository.findLocations(query, code, pageRequest).map(this::toResponse));
    }

    public LocationResponseDTO getLocation(Integer locationId) {
        return toResponse(findLocation(locationId));
    }

    @Transactional
    public LocationResponseDTO createLocation(Integer actorId, LocationRequestDTO request) {
        userService.requireAdministrator(actorId);
        List<Tag> tags = tagRepository.findAllById(request.tagCodes());
        if (tags.size() != request.tagCodes().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more tag codes do not exist");
        }

        Location location = new Location();
        location.setName(request.locationName());
        location.setCountry(request.country());
        location.setProvince(request.province());
        location.setCity(request.city());
        location.setBarangay(request.barangay());
        location.setDescription(request.description());
        location.setTags(new HashSet<>(tags));
        return toResponse(locationRepository.save(location));
    }

    public RecommendationResponseDTO recommend(RecommendationRequestDTO request) {
        List<Location> locations = request.tagCodes().isEmpty()
                ? locationRepository.findAll(RECOMMENDATION_LIMIT).getContent()
                : locationRepository.findByPreferredTags(request.tagCodes(), RECOMMENDATION_LIMIT);
        return new RecommendationResponseDTO(locations.stream().map(this::toResponse).toList());
    }

    Location findLocation(Integer locationId) {
        if (locationId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location ID must be positive");
        }
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
    }

    private LocationResponseDTO toResponse(Location location) {
        // Map the tags inside the transaction so the response contains no JPA entities.
        List<TagResponseDTO> tags = location.getTags().stream()
                .sorted(Comparator.comparing(Tag::getCode))
                .map(tag -> new TagResponseDTO(tag.getCode(), tag.getName(), tag.getDescription()))
                .toList();

        return new LocationResponseDTO(location.getLocationID(), location.getLocName(), location.getCountry(),
                location.getProvince(), location.getCity(), location.getBarangay(), location.getDescription(),
                location.getEnjoymentRating(), location.getBudgetRating(), tags);
    }
}
