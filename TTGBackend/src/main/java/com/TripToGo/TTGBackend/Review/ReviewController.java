package com.TripToGo.TTGBackend.Review;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController 
public class ReviewController {

    @GetMapping("/reviews/health")
    public String healthCheck()
    {
        return "Review endpoint healthy";
    }
}
