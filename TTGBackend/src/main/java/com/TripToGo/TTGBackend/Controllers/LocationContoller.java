package com.TripToGo.TTGBackend.Controllers;

import java.net.URI;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.TripToGo.TTGBackend.DTOs.LocationRequestDTO;
import com.TripToGo.TTGBackend.DTOs.LocationResponseDTO;
import com.TripToGo.TTGBackend.DTOs.PageQueryDTO;
import com.TripToGo.TTGBackend.DTOs.PageResponseDTO;
import com.TripToGo.TTGBackend.DTOs.RecommendationRequestDTO;
import com.TripToGo.TTGBackend.DTOs.RecommendationResponseDTO;
import com.TripToGo.TTGBackend.Services.LocationService;

@RestController 
public class LocationContoller {

    private final LocationService locationService;

    public LocationContoller(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/location/health")
    public String healthCheck()
    {
        return "Location endpoint healthy";
    }

    // Preserve the original plain-text route for existing callers.
    @GetMapping("/locations/s/{location-id}")
    public String getLocation(
        @PathVariable("location-id") String locationId
    ) {
        return "Location ID: " + locationId;
    }
    @GetMapping("/locations")
    public PageResponseDTO<LocationResponseDTO> listLocations(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "tagCode", defaultValue = "") String tagCode,
            @Validated @ModelAttribute("pageQuery") PageQueryDTO page) {
        return locationService.listLocations(query, tagCode, page);
    }

    @GetMapping("/locations/{locationId}")
    public LocationResponseDTO getLocationDetails(@PathVariable("locationId") Integer locationId) {
        return locationService.getLocation(locationId);
    }

    @PostMapping(path = "/locations", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LocationResponseDTO> createLocation(@AuthenticationPrincipal Integer actorId,
            @RequestBody LocationRequestDTO request) {
        LocationResponseDTO location = locationService.createLocation(actorId, request);
        return ResponseEntity.created(URI.create("/locations/" + location.locationId())).body(location);
    }

    @PostMapping(path = "/recommendations", consumes = MediaType.APPLICATION_JSON_VALUE)
    public RecommendationResponseDTO recommend(@RequestBody RecommendationRequestDTO request) {
        return locationService.recommend(request);
    }
}
