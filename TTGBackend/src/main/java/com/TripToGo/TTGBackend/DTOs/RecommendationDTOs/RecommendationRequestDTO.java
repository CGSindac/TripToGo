package com.TripToGo.TTGBackend.DTOs.RecommendationDTOs;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter 
@AllArgsConstructor @NoArgsConstructor 
public class RecommendationRequestDTO {
    

    private Address address;
    private Integer budgetRange;
    private List<String> tags;
    
    @Getter @Setter 
    @AllArgsConstructor @NoArgsConstructor 
    private static class Address {
        private String country;
        private String province;
        private String city;
    }
}