package com.TripToGo.TTGBackend.DTOs.ReviewDTOs;

import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewRequestDTO.Address;

public final class ReviewOptionsDTO {
    private ReviewOptionsDTO() {}

    public record LocationOption(Integer locationId, String name, Address address) {}

    public record TagOption(String code, String name, String description) {}
}
