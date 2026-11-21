package com.TripToGo.TTGBackend.DTOs;

import java.util.List;

/** Optional preferred tag codes for location recommendations. */
public record RecommendationRequestDTO(List<String> tagCodes) {

    public RecommendationRequestDTO {
        tagCodes = LocationInputValidation.validatedTagCodes(tagCodes);
    }
}
