package com.TripToGo.TTGBackend.DTOs;

import java.util.List;

public record LocationResponseDTO(
        Integer locationId,
        String locationName,
        String country,
        String province,
        String city,
        String barangay,
        String description,
        float enjoymentRating,
        float budgetRating,
        List<TagResponseDTO> tags) {
}
