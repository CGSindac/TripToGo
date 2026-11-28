package com.TripToGo.TTGBackend.Controllers;

import java.util.List;

import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpHeaders;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewRequestDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewResponseDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewOptionsDTO.LocationOption;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewOptionsDTO.TagOption;
import com.TripToGo.TTGBackend.Services.AuthService;
import com.TripToGo.TTGBackend.Services.ReviewService;

@RestController
@RequestMapping("/reviews")
@CrossOrigin 
public class ReviewController {
    private final ReviewService reviews;
    private final AuthService auth;

    public ReviewController(ReviewService reviews, AuthService auth) {
        this.reviews = reviews;
        this.auth = auth;
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
    public ReviewResponseDTO getReview(@PathVariable int reviewId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return reviews.getReview(reviewId, authorization == null ? null : auth.requireUser(authorization));
    }

    @GetMapping("/mine")
    public PagedModel<ReviewResponseDTO> mine(@RequestParam(defaultValue = "0") int page,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return new PagedModel<>(reviews.submittedBy(auth.requireUser(authorization), page));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponseDTO submit(@RequestBody ReviewRequestDTO request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return reviews.submit(auth.requireUser(authorization), request);
    }

    @GetMapping("/moderation/pending")
    public PagedModel<ReviewResponseDTO> pending(@RequestParam(defaultValue = "0") int page,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return new PagedModel<>(reviews.pending(auth.requireUser(authorization), page));
    }

    @PutMapping("/moderation/{reviewId}/location")
    public ReviewResponseDTO approveLocation(@PathVariable int reviewId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return reviews.approveLocation(reviewId, auth.requireUser(authorization));
    }

    @PutMapping("/moderation/{reviewId}/approval")
    public ReviewResponseDTO approveReview(@PathVariable int reviewId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return reviews.approveReview(reviewId, auth.requireUser(authorization));
    }

    @PutMapping("/moderation/{reviewId}/rejection")
    public ReviewResponseDTO rejectReview(@PathVariable int reviewId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return reviews.rejectReview(reviewId, auth.requireUser(authorization));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleReviewError(ResponseStatusException exception) {
        return exception.getBody();
    }
}
