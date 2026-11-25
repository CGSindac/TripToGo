package com.TripToGo.TTGBackend.DTOs.LocationDTOs;

import java.util.List;

public record LocationRequestDTO(String name, Address address, String description, List<String> tagCodes) {
    public record Address(String country, String province, String city, String barangay) {}
}
