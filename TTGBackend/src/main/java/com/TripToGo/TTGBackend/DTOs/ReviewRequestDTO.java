package com.TripToGo.TTGBackend.DTOs;

import static com.TripToGo.TTGBackend.DTOs.RequestValidationException.require;

/** Review content supplied by a caller. The endpoint supplies the location and author. */
public record ReviewRequestDTO(Integer enjoymentRating, Integer budgetRating, String writtenReview) {

    public ReviewRequestDTO {
        require(enjoymentRating != null, "enjoymentRating", "Enjoyment rating is required");
        require(budgetRating != null, "budgetRating", "Budget rating is required");
        require(enjoymentRating >= 1 && enjoymentRating <= 5, "enjoymentRating",
                "Enjoyment rating must be between 1 and 5");
        require(budgetRating >= 1 && budgetRating <= 5, "budgetRating", "Budget rating must be between 1 and 5");
    }
}
