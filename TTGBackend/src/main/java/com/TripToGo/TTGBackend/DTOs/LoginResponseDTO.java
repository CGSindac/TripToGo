package com.TripToGo.TTGBackend.DTOs;

/** Profile returned after login. The session credential is sent as an HTTP cookie. */
public record LoginResponseDTO(UserResponseDTO user) {
}
