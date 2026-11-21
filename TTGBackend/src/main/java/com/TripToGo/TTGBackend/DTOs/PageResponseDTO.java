package com.TripToGo.TTGBackend.DTOs;

import java.util.List;

import org.springframework.data.domain.Page;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PageResponseDTO<T>(List<T> items, int page, int size, long totalItems) {

    public static <T> PageResponseDTO<T> from(Page<T> page) {
        return new PageResponseDTO<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @JsonProperty
    public long totalPages() {
        return size > 0 && totalItems > 0 ? 1 + (totalItems - 1) / size : 0;
    }

    @JsonProperty
    public boolean hasNext() {
        return (long) page + 1 < totalPages();
    }
}
