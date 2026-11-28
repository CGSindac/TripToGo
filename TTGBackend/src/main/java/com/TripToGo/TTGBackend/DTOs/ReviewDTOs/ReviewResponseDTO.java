package com.TripToGo.TTGBackend.DTOs.ReviewDTOs;

import java.time.LocalDateTime;
import java.util.List;

import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewRequestDTO.Address;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewRequestDTO.NewLocation;
import com.TripToGo.TTGBackend.Models.ReviewStatus;

public record ReviewResponseDTO(
        Integer reviewId,
        Integer userId,
        Integer locationId,
        String locationName,
        Address locationAddress,
        NewLocation proposedLocation,
        String authorUsername,
        List<String> tagCodes,
        List<String> tagNames,
        int enjoymentRating,
        int budgetRating,
        String writtenReview,
        ReviewStatus status,
        LocalDateTime createdAt) {
}
