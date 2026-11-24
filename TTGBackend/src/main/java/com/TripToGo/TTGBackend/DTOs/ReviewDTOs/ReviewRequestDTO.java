package com.TripToGo.TTGBackend.DTOs.ReviewDTOs;

import java.math.BigDecimal;
import java.util.List;
    
public record ReviewRequestDTO(
        BigDecimal locationId,
        NewLocation newLocation,
        List<String> tagCodes,
        BigDecimal enjoymentRating,
        BigDecimal budgetRating,
        String writtenReview) {

    public record NewLocation(String name, Address address) {}

    public record Address(String country, String province, String city, String barangay) {}
}
