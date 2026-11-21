package com.TripToGo.TTGBackend.DTOs;

public record CsrfTokenResponseDTO(String headerName, String parameterName, String token) {
}
