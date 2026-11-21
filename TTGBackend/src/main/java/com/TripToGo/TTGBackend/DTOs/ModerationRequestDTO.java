package com.TripToGo.TTGBackend.DTOs;

import static com.TripToGo.TTGBackend.DTOs.RequestValidationException.require;

public record ModerationRequestDTO(String decision) {

    public ModerationRequestDTO {
        require("APPROVED".equals(decision) || "REJECTED".equals(decision), "decision",
                "Decision must be APPROVED or REJECTED");
    }
}
