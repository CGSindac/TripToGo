package com.TripToGo.TTGBackend.DTOs;

import java.util.List;

import org.springframework.util.Assert;

/** Fields a caller can set when creating or replacing a location. */
public record LocationRequestDTO(
        String locationName,
        String country,
        String province,
        String city,
        String barangay,
        String description,
        List<String> tagCodes) {

    public LocationRequestDTO {
        Assert.hasText(locationName, "Location name is required");
        Assert.hasText(country, "Country is required");
        Assert.isTrue(country.length() <= 25, "Country must have at most 25 characters");
        Assert.hasText(province, "Province is required");
        Assert.hasText(city, "City is required");
        Assert.hasText(barangay, "Barangay is required");

        if (tagCodes == null) {
            tagCodes = List.of();
        }
        for (String tagCode : tagCodes) {
            Assert.hasText(tagCode, "Tag codes cannot be blank");
            Assert.isTrue(tagCode.length() == 4, "Tag codes must have four characters");
        }
        tagCodes = List.copyOf(tagCodes);
    }
}
