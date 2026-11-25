package com.TripToGo.TTGBackend.DTOs.UserDTOs;

/** Profile fields for a partial update. A null field keeps its current value. */
public record UserUpdateDTO(String username, String email) {
}
