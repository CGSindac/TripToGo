package com.TripToGo.TTGBackend.DTOs;

import org.springframework.util.Assert;

/** Fields a caller can change on a user profile. A null field means no change. */
public record UserUpdateDTO(String username, String email) {

    public UserUpdateDTO {
        Assert.isTrue(username != null || email != null, "Username or email is required");
        if (username != null) {
            AccountInputValidation.validateUsername(username);
        }
        if (email != null) {
            AccountInputValidation.validateEmail(email);
        }
    }
}
