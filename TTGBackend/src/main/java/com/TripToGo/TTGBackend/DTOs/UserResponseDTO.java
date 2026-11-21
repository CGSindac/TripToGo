package com.TripToGo.TTGBackend.DTOs;

import java.time.LocalDateTime;

public record UserResponseDTO(Integer userId, String username, String email, String role, LocalDateTime creationDate) {
}
