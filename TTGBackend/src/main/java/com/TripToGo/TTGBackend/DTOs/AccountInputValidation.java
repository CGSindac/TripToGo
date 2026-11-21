package com.TripToGo.TTGBackend.DTOs;

import static com.TripToGo.TTGBackend.DTOs.RequestValidationException.require;
import static com.TripToGo.TTGBackend.DTOs.RequestValidationException.requireText;

import java.util.regex.Pattern;

final class AccountInputValidation {

    private static final Pattern EMAIL_ADDRESS = Pattern.compile("[^\\s@]+@[^\\s@]+\\.[^\\s@]+");

    private AccountInputValidation() {
    }

    static void validateUsername(String username) {
        requireText(username, "username", "Username is required");
        require(username.length() <= 50, "username", "Username must have at most 50 characters");
    }

    static void validateEmail(String email) {
        requireText(email, "email", "Email is required");
        require(email.length() <= 100, "email", "Email must have at most 100 characters");
        require(EMAIL_ADDRESS.matcher(email).matches(), "email", "Email format is invalid");
    }

    static void validatePassword(String password) {
        requireText(password, "password", "Password is required");
        require(password.length() <= 128, "password", "Password must have at most 128 characters");
    }
}
