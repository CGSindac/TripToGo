package com.TripToGo.TTGBackend.Controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewRequestDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewResponseDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewOptionsDTO.LocationOption;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewOptionsDTO.TagOption;
import com.TripToGo.TTGBackend.Services.ReviewService;

@RestController
@RequestMapping("/reviews")
@CrossOrigin 
public class ReviewController {
    private final ReviewService reviews;

    public ReviewController(ReviewService reviews) {
        this.reviews = reviews;
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "Review endpoint healthy";
    }

    @GetMapping("/locations")
    public PagedModel<LocationOption> locationOptions(@RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page) {
        return new PagedModel<>(reviews.locationOptions(search, page));
    }

    @GetMapping("/tags")
    public List<TagOption> tagOptions() {
        return reviews.tagOptions();
    }

    @GetMapping("/locations/{locationId}")
    public PagedModel<ReviewResponseDTO> publishedForLocation(@PathVariable int locationId,
            @RequestParam(defaultValue = "0") int page) {
        return new PagedModel<>(reviews.publishedForLocation(locationId, page));
    }

    @GetMapping("/{reviewId}")
    public ReviewResponseDTO getReview(@PathVariable int reviewId, Principal principal) {
        return reviews.getReview(reviewId, principal.getName());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponseDTO submit(@RequestBody ReviewRequestDTO request, Principal principal) {
        return reviews.submit(principal.getName(), request);
    }

    @GetMapping("/moderation/pending")
    public PagedModel<ReviewResponseDTO> pending(@RequestParam(defaultValue = "0") int page, Principal principal) {
        return new PagedModel<>(reviews.pending(principal.getName(), page));
    }

    @PutMapping("/moderation/{reviewId}/location")
    public ReviewResponseDTO approveLocation(@PathVariable int reviewId, Principal principal) {
        return reviews.approveLocation(reviewId, principal.getName());
    }

    @PutMapping("/moderation/{reviewId}/approval")
    public ReviewResponseDTO approveReview(@PathVariable int reviewId, Principal principal) {
        return reviews.approveReview(reviewId, principal.getName());
    }

    @PutMapping("/moderation/{reviewId}/rejection")
    public ReviewResponseDTO rejectReview(@PathVariable int reviewId, Principal principal) {
        return reviews.rejectReview(reviewId, principal.getName());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleReviewError(ResponseStatusException exception) {
        return exception.getBody();
    }
}
