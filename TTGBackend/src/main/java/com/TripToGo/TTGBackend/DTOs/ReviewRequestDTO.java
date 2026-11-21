package com.TripToGo.TTGBackend.DTOs;

import org.springframework.util.Assert;

/** Review content supplied by a caller. The endpoint supplies the location and author. */
public record ReviewRequestDTO(Integer enjoymentRating, Integer budgetRating, String writtenReview) {

    public ReviewRequestDTO {
        Assert.notNull(enjoymentRating, "Enjoyment rating is required");
        Assert.notNull(budgetRating, "Budget rating is required");
    }
}
