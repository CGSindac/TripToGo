package com.TripToGo.TTGBackend.DTOs;

import org.springframework.util.StringUtils;

/** A request error with a safe, client-facing message and an optional JSON field path. */
public final class RequestValidationException extends IllegalArgumentException {

    private final String field;

    private RequestValidationException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String field() {
        return field;
    }

    static void require(boolean valid, String field, String message) {
        if (!valid) {
            throw new RequestValidationException(field, message);
        }
    }

    static void requireText(String value, String field, String message) {
        require(StringUtils.hasText(value), field, message);
    }
}
