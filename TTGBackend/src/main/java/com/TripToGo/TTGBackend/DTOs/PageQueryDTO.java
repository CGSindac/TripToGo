package com.TripToGo.TTGBackend.DTOs;

import org.springframework.validation.Validator;

public record PageQueryDTO(Integer page, Integer size) {

    public static final Validator VALIDATOR = Validator.forType(PageQueryDTO.class, (query, errors) -> {
        if (query.page() < 0) {
            errors.rejectValue("page", "outOfRange", "Page must be zero or greater");
        }
        if (query.size() < 1 || query.size() > 100) {
            errors.rejectValue("size", "outOfRange", "Size must be between 1 and 100");
        }
    });


    public PageQueryDTO {
        if (page == null) {
            page = 0;
        }
        if (size == null) {
            size = 20;
        }
    }
}
