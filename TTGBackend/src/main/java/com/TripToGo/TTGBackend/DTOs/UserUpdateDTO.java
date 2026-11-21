package com.TripToGo.TTGBackend.DTOs;

import static com.TripToGo.TTGBackend.DTOs.RequestValidationException.require;

/** Fields a caller can change on a user profile. A null field means no change. */
public record UserUpdateDTO(String username, String email) {

    public UserUpdateDTO {
        require(username != null || email != null, null, "Username or email is required");
        if (username != null) {
            AccountInputValidation.validateUsername(username);
        }
        if (email != null) {
            AccountInputValidation.validateEmail(email);
        }
    }
}
