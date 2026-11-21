package com.TripToGo.TTGBackend.DTOs;

public record PageQueryDTO(Integer page, Integer size) {

    public PageQueryDTO {
        if (page == null) {
            page = 0;
        }
        if (size == null) {
            size = 20;
        }
    }
}
