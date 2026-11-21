package com.TripToGo.TTGBackend.DTOs;

import java.util.List;

import org.springframework.data.domain.Page;

public record PageResponseDTO<T>(List<T> items, int page, int size, long totalItems) {

    public static <T> PageResponseDTO<T> from(Page<T> page) {
        return new PageResponseDTO<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements());
    }
}
