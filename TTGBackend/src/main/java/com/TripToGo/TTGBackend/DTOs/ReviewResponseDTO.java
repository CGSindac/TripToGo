package com.TripToGo.TTGBackend.DTOs;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

public record ReviewResponseDTO(
        Integer reviewId,
        Integer locationId,
        String authorUsername,
        int enjoymentRating,
        int budgetRating,
        String writtenReview,
        String status,
        LocalDateTime creationDate,
        @JsonInclude(JsonInclude.Include.NON_NULL) Integer verifiedByUserId) {
}
