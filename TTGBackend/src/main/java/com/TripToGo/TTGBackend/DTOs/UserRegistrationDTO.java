package com.TripToGo.TTGBackend.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserRegistrationDTO(
        String username,
        String email,
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) String password) {

    public UserRegistrationDTO {
        AccountInputValidation.validateUsername(username);
        AccountInputValidation.validateEmail(email);
        AccountInputValidation.validatePassword(password);
    }

    @Override
    public String toString() {
        return "UserRegistrationDTO[credentials redacted]";
    }
}
