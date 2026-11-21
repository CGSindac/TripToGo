package com.TripToGo.TTGBackend.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserLoginDTO(String email, @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) String password) {

    public UserLoginDTO {
        AccountInputValidation.validateEmail(email);
        AccountInputValidation.validatePassword(password);
    }

    @Override
    public String toString() {
        return "UserLoginDTO[credentials redacted]";
    }
}
