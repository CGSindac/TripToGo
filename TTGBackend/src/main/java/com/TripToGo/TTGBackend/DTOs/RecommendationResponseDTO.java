package com.TripToGo.TTGBackend.DTOs;

import java.util.List;

public record RecommendationResponseDTO(List<LocationResponseDTO> locations) {
}
