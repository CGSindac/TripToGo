package com.TripToGo.TTGBackend.DTOs;

import static com.TripToGo.TTGBackend.DTOs.RequestValidationException.require;
import static com.TripToGo.TTGBackend.DTOs.RequestValidationException.requireText;

import java.util.List;

/** Fields a caller can set when submitting a location. */
public record LocationRequestDTO(
        String locationName,
        String country,
        String province,
        String city,
        String barangay,
        String description,
        List<String> tagCodes) {

    public LocationRequestDTO {
        requireText(locationName, "locationName", "Location name is required");
        requireText(country, "country", "Country is required");
        require(country.length() <= 25, "country", "Country must have at most 25 characters");
        requireText(province, "province", "Province is required");
        requireText(city, "city", "City is required");
        requireText(barangay, "barangay", "Barangay is required");

        tagCodes = LocationInputValidation.validatedTagCodes(tagCodes);
    }
}
