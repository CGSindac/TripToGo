package com.TripToGo.TTGBackend.DTOs.LocationDTOs;

import java.util.List;

import com.TripToGo.TTGBackend.DTOs.LocationDTOs.LocationRequestDTO.Address;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewOptionsDTO.TagOption;

public record LocationResponseDTO(
        Integer locationId,
        String name,
        Address address,
        String description,
        List<TagOption> tags,
        double enjoymentRating,
        double budgetRating) {}
