package com.TripToGo.TTGBackend.Controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.TripToGo.TTGBackend.DTOs.ModerationRequestDTO;
import com.TripToGo.TTGBackend.DTOs.PageQueryDTO;
import com.TripToGo.TTGBackend.DTOs.PageResponseDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewRequestDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewResponseDTO;
import com.TripToGo.TTGBackend.Services.ReviewService;

@RestController 
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/reviews/health")
    public String healthCheck()
    {
        return "Review endpoint healthy";
    }

    @GetMapping("/locations/{locationId}/reviews")
    public PageResponseDTO<ReviewResponseDTO> listLocationReviews(@PathVariable("locationId") Integer locationId,
            @Validated @ModelAttribute("pageQuery") PageQueryDTO page) {
        return reviewService.listLocationReviews(locationId, page);
    }

    @PostMapping(path = "/locations/{locationId}/reviews", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponseDTO submitReview(@AuthenticationPrincipal Integer actorId,
            @PathVariable("locationId") Integer locationId, @RequestBody ReviewRequestDTO request) {
        return reviewService.submitReview(actorId, locationId, request);
    }

    @GetMapping("/reviews/pending")
    public PageResponseDTO<ReviewResponseDTO> listPendingReviews(@AuthenticationPrincipal Integer actorId,
            @Validated @ModelAttribute("pageQuery") PageQueryDTO page) {
        return reviewService.listPendingReviews(actorId, page);
    }

    @PatchMapping(path = "/reviews/{reviewId}/moderation", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ReviewResponseDTO moderateReview(@AuthenticationPrincipal Integer actorId,
            @PathVariable("reviewId") Integer reviewId, @RequestBody ModerationRequestDTO request) {
        return reviewService.moderateReview(actorId, reviewId, request);
    }
}
