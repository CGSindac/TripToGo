package com.TripToGo.TTGBackend.Services;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.ModerationRequestDTO;
import com.TripToGo.TTGBackend.DTOs.PageQueryDTO;
import com.TripToGo.TTGBackend.DTOs.PageResponseDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewRequestDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewResponseDTO;
import com.TripToGo.TTGBackend.Models.Location;
import com.TripToGo.TTGBackend.Models.Review;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.ReviewRepository;

@Service
@Transactional(readOnly = true)
public class ReviewService {

    private static final String PENDING_REVIEW_STATUS = "PENDING";
    private static final String PUBLIC_REVIEW_STATUS = "APPROVED";
    private static final Sort NEWEST_FIRST = Sort.by("reviewID").descending();

    private final LocationService locationService;
    private final ReviewRepository reviewRepository;
    private final UserService userService;

    public ReviewService(LocationService locationService, ReviewRepository reviewRepository, UserService userService) {
        this.locationService = locationService;
        this.reviewRepository = reviewRepository;
        this.userService = userService;
    }

    public PageResponseDTO<ReviewResponseDTO> listLocationReviews(Integer locationId, PageQueryDTO page) {
        Location location = locationService.findLocation(locationId);
        PageRequest pageRequest = PageRequest.of(page.page(), page.size(), NEWEST_FIRST);
        return PageResponseDTO.from(reviewRepository.findByLocationAndStatus(location, PUBLIC_REVIEW_STATUS, pageRequest)
                .map(review -> toResponse(review, null)));
    }

    @Transactional
    public ReviewResponseDTO submitReview(Integer actorId, Integer locationId, ReviewRequestDTO request) {
        User author = userService.requireActor(actorId);
        Location location = locationService.findLocation(locationId);

        Review review = new Review();
        review.setUser(author);
        review.setLocation(location);
        review.setEnjoymentRating(request.enjoymentRating());
        review.setBudgetRating(request.budgetRating());
        review.setWrittenReview(request.writtenReview());
        return toResponse(reviewRepository.save(review), null);
    }

    public PageResponseDTO<ReviewResponseDTO> listPendingReviews(Integer actorId, PageQueryDTO page) {
        userService.requireAdministrator(actorId);
        PageRequest pageRequest = PageRequest.of(page.page(), page.size(), NEWEST_FIRST);
        return PageResponseDTO.from(reviewRepository.findByStatus(PENDING_REVIEW_STATUS, pageRequest)
                .map(review -> toResponse(review, null)));
    }

    @Transactional
    public ReviewResponseDTO moderateReview(Integer actorId, Integer reviewId, ModerationRequestDTO request) {
        User moderator = userService.requireAdministrator(actorId);
        if (reviewId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review ID must be positive");
        }
        Review review = reviewRepository.findByReviewID(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        if (PENDING_REVIEW_STATUS.equals(review.getStatus())) {
            review.setStatus(request.decision());
            review.setVerifiedBy(moderator);
        } else if (!request.decision().equals(review.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Review has already been moderated");
        }
        User verifier = review.getVerifiedBy();
        return toResponse(review, verifier == null ? null : verifier.getUserId());
    }

    private ReviewResponseDTO toResponse(Review review, Integer verifiedByUserId) {
        Location location = review.getLocation();
        Integer locationId = location == null ? null : location.getLocationID();
        User author = review.getUser();
        String username = author == null ? null : author.getUsername();
        return new ReviewResponseDTO(review.getReviewID(), locationId, username, review.getEnjoymentRating(),
                review.getBudgetRating(), review.getWrittenReview(), review.getStatus(), review.getCreationDate(),
                verifiedByUserId);
    }
}
