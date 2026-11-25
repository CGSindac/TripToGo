package com.TripToGo.TTGBackend.Controllers;
import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TripToGo.TTGBackend.DTOs.LocationDTOs.LocationResponseDTO;
import com.TripToGo.TTGBackend.DTOs.RecommendationDTOs.RecommendationRequestDTO;
import com.TripToGo.TTGBackend.Services.RecommendationService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController 
@RequestMapping ("/trips")
public class RecommendationController {

    private final RecommendationService recommendations;

    public RecommendationController(
        RecommendationService recommendations
    )
    {
        this.recommendations = recommendations;
    }

    // Create a Trip
    @PostMapping("")
    public List<LocationResponseDTO> postMethodName(@RequestBody RecommendationRequestDTO entity, @RequestBody String username) {
        return recommendations.generateRecommendation(entity, username);
    }
    

    
}
