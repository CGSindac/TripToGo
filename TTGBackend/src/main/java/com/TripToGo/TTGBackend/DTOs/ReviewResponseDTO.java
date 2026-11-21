package com.TripToGo.TTGBackend.DTOs;

import java.time.LocalDateTime;

public record ReviewResponseDTO(
        Integer reviewId,
        Integer locationId,
        String authorUsername,
        int enjoymentRating,
        int budgetRating,
        String writtenReview,
        String status,
        LocalDateTime creationDate) {
}
