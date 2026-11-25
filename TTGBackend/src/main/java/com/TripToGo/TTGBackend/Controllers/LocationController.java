package com.TripToGo.TTGBackend.Controllers;

import java.util.List;

import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.LocationDTOs.LocationRequestDTO;
import com.TripToGo.TTGBackend.DTOs.LocationDTOs.LocationResponseDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewOptionsDTO.TagOption;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewResponseDTO;
import com.TripToGo.TTGBackend.Services.LocationService;
import com.TripToGo.TTGBackend.Services.ReviewService;

@RestController
public class LocationController {
    private final LocationService locations;
    private final ReviewService reviews;

    public LocationController(LocationService locations, ReviewService reviews) {
        this.locations = locations;
        this.reviews = reviews;
    }

    @GetMapping({"/location/health", "/locations/health"})
    public String healthCheck() {
        return "Location endpoint healthy";
    }

    @GetMapping("/locations")
    public PagedModel<LocationResponseDTO> browse(@RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) List<String> tags, @RequestParam(defaultValue = "0") int page) {
        return new PagedModel<>(locations.browse(search, tags, page));
    }

    @GetMapping({"/locations/{locationId}", "/locations/s/{locationId}"})
    public LocationResponseDTO getLocation(@PathVariable int locationId) {
        return locations.get(locationId);
    }

    @GetMapping("/locations/tags")
    public List<TagOption> tags() {
        return reviews.tagOptions();
    }

    @GetMapping("/locations/{locationId}/reviews")
    public PagedModel<ReviewResponseDTO> reviews(@PathVariable int locationId,
            @RequestParam(defaultValue = "0") int page) {
        return new PagedModel<>(reviews.publishedForLocation(locationId, page));
    }

    @PostMapping(path = "/locations", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public LocationResponseDTO create(@RequestBody LocationRequestDTO request) {
        return locations.save(null, request);
    }

    @PutMapping(path = "/locations/{locationId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public LocationResponseDTO update(@PathVariable int locationId, @RequestBody LocationRequestDTO request) {
        return locations.save(locationId, request);
    }

    @DeleteMapping("/locations/{locationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int locationId) {
        locations.delete(locationId);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleLocationError(ResponseStatusException exception) {
        return exception.getBody();
    }
}
