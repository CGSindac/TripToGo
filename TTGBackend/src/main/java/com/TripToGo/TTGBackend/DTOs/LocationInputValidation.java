package com.TripToGo.TTGBackend.DTOs;

import static com.TripToGo.TTGBackend.DTOs.RequestValidationException.require;
import static com.TripToGo.TTGBackend.DTOs.RequestValidationException.requireText;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

final class LocationInputValidation {

    private LocationInputValidation() {
    }

    static List<String> validatedTagCodes(List<String> tagCodes) {
        if (tagCodes == null) {
            return List.of();
        }
        Set<String> distinctCodes = new LinkedHashSet<>();
        int index = 0;
        for (String code : tagCodes) {
            String field = "tagCodes[" + index++ + "]";
            requireText(code, field, "Tag codes cannot be blank");
            require(code.length() == 4, field, "Tag codes must have four characters");
            distinctCodes.add(code);
        }
        return List.copyOf(distinctCodes);
    }
}
