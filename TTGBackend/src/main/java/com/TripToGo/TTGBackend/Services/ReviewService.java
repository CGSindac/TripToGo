package com.TripToGo.TTGBackend.Services;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewRequestDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewResponseDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewOptionsDTO.LocationOption;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewOptionsDTO.TagOption;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewRequestDTO.Address;
import com.TripToGo.TTGBackend.DTOs.ReviewDTOs.ReviewRequestDTO.NewLocation;
import com.TripToGo.TTGBackend.Models.Admin;
import com.TripToGo.TTGBackend.Models.Location;
import com.TripToGo.TTGBackend.Models.Review;
import com.TripToGo.TTGBackend.Models.ReviewLocationProposal;
import com.TripToGo.TTGBackend.Models.ReviewStatus;
import com.TripToGo.TTGBackend.Models.Tag;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewAccountRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewLocationRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewTagRepository;

@Service
@Transactional(readOnly = true)
public class ReviewService {
    private static final int PAGE_SIZE = 20;
    private static final int HOURLY_REVIEW_LIMIT = 5;
    private static final Pattern WHITESPACE = Pattern.compile("\\s+", Pattern.UNICODE_CHARACTER_CLASS);
    private static final Sort RECENT_REVIEWS = Sort.by(Sort.Direction.DESC, "creationDate", "reviewID");

    private final ReviewRepository reviews;
    private final ReviewLocationRepository locations;
    private final ReviewTagRepository tags;
    private final ReviewAccountRepository accounts;
    private final LocationService locationService;

    public ReviewService(ReviewRepository reviews, ReviewLocationRepository locations,
            ReviewTagRepository tags, ReviewAccountRepository accounts, LocationService locationService) {
        this.reviews = reviews;
        this.locations = locations;
        this.tags = tags;
        this.accounts = accounts;
        this.locationService = locationService;
    }

    public Page<LocationOption> locationOptions(String search, int page) {
        String name = normalizeLine(search);
        if (name.length() > 255 || name.codePoints().anyMatch(Character::isISOControl)) {
            throw badRequest("Location search must contain at most 255 valid characters.");
        }
        return locations.findByLocNameContainingIgnoreCase(name,
                pageRequest(page, Sort.by("locName", "locationId")))
                .map(location -> new LocationOption(location.getLocationID(), location.getLocName(),
                        new Address(location.getCountry(), location.getProvince(),
                                location.getCity(), location.getBarangay())));
    }

    public List<TagOption> tagOptions() {
        return tags.findAllByOrderByNameAscCodeAsc().stream()
                .map(tag -> new TagOption(tag.getCode().strip(), tag.getName(), tag.getDescription()))
                .toList();
    }

    public Page<ReviewResponseDTO> publishedForLocation(int locationId, int page) {
        if (!locations.existsById(locationId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location was not found.");
        }
        return reviews.findByLocation_LocationIdAndStatus(
                locationId, ReviewStatus.VERIFIED, pageRequest(page, RECENT_REVIEWS))
                .map(review -> toResponse(review, false));
    }

    public ReviewResponseDTO getReview(int reviewId, String username) {
        Review review = reviews.findById(reviewId).orElseThrow(ReviewService::reviewNotFound);
        boolean owner = review.getUser() != null && review.getUser().getUsername().equals(username);
        boolean canViewSubmission = owner || accounts.findAdmin(username).isPresent();
        if (review.getStatus() != ReviewStatus.VERIFIED && !canViewSubmission) {
            throw reviewNotFound();
        }
        return toResponse(review, canViewSubmission);
    }

    public Page<ReviewResponseDTO> pending(String username, int page) {
        requireAdmin(username);
        return reviews.findByStatusIn(List.of(ReviewStatus.PENDING_LOCATION, ReviewStatus.PENDING),
                pageRequest(page, Sort.by("creationDate", "reviewID")))
                .map(review -> toResponse(review, true));
    }

    @Transactional
    public ReviewResponseDTO submit(String username, ReviewRequestDTO request) {
        boolean existingLocation = request.locationId() != null;
        if (existingLocation == (request.newLocation() != null)) {
            throw badRequest("Supply either locationId or newLocation.");
        }
        Integer locationId = existingLocation
                ? requireWholeNumber(request.locationId(), 1, Integer.MAX_VALUE, "locationId")
                : null;
        ReviewLocationProposal proposal = existingLocation ? null : normalizeProposal(request.newLocation());

        Review review = new Review();
        review.setEnjoymentRating(requireWholeNumber(request.enjoymentRating(), 1, 10, "enjoymentRating"));
        review.setBudgetRating(requireWholeNumber(request.budgetRating(), 1, 10, "budgetRating"));
        review.setWrittenReview(normalizeReviewText(request.writtenReview()));
        review.addTags(resolveTags(request.tagCodes()));

        // Serialize per-account checks with submissions from the same account.
        User user = accounts.findForUpdate(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account was not found."));
        if (reviews.countByUser_UserIdAndCreationDateAfter(
                user.getUserId(), LocalDateTime.now().minusHours(1)) >= HOURLY_REVIEW_LIMIT) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Hourly review limit reached.");
        }
        review.setUser(user);

        if (existingLocation) {
            Location location = lockLocation(locationId);
            requireNoReviewAtLocation(user, location);
            review.setLocation(location);
            verify(review, null);
        } else {
            if (matchingLocation(proposal).isPresent()) {
                throw conflict("This location is already listed. Submit using its locationId.");
            }
            if (reviews.existsByUser_UserIdAndProposedLocation_KeyAndStatus(
                    user.getUserId(), proposal.getKey(), ReviewStatus.PENDING_LOCATION)) {
                throw conflict("You already have a pending review for this proposed location.");
            }
            review.setProposedLocation(proposal);
            review.setStatus(ReviewStatus.PENDING_LOCATION);
        }
        return toResponse(reviews.save(review), true);
    }

    @Transactional
    public ReviewResponseDTO approveLocation(int reviewId, String username) {
        requireAdmin(username);
        Review review = lockReview(reviewId);
        if (review.getLocation() != null && (review.getStatus() == ReviewStatus.PENDING
                || review.getStatus() == ReviewStatus.VERIFIED) && review.getProposedLocation() != null) {
            return toResponse(review, true);
        }
        if (review.getStatus() != ReviewStatus.PENDING_LOCATION || review.getProposedLocation() == null) {
            throw conflict("This review is not awaiting location approval.");
        }
        User author = accounts.findForUpdate(review.getUser().getUsername())
                .orElseThrow(() -> conflict("The review author no longer exists."));
        ReviewLocationProposal proposal = review.getProposedLocation();

        // A proposal may be pending on several reviews. Serialize location creation by address and name.
        locationService.lockLocationIdentity(proposal.getKey());
        Location location = matchingLocation(proposal)
                .map(match -> lockLocation(match.getLocationID()))
                .orElseGet(() -> createLocation(proposal));
        requireNoReviewAtLocation(author, location);
        review.setLocation(location);
        review.setStatus(ReviewStatus.PENDING);
        return toResponse(review, true);
    }

    @Transactional
    public ReviewResponseDTO approveReview(int reviewId, String username) {
        Admin admin = requireAdmin(username);
        Review review = lockReview(reviewId);
        if (review.getStatus() == ReviewStatus.VERIFIED) {
            return toResponse(review, true);
        }
        if (review.getStatus() != ReviewStatus.PENDING || review.getLocation() == null) {
            throw conflict("The location must be approved before the review can be verified.");
        }
        review.setLocation(lockLocation(review.getLocation().getLocationID()));
        verify(review, admin);
        return toResponse(review, true);
    }

    @Transactional
    public ReviewResponseDTO rejectReview(int reviewId, String username) {
        Admin admin = requireAdmin(username);
        Review review = lockReview(reviewId);
        if (review.getStatus() == ReviewStatus.VERIFIED) {
            throw conflict("This review has already been verified.");
        }
        if (review.getStatus() != ReviewStatus.REJECTED) {
            review.setStatus(ReviewStatus.REJECTED);
            review.setVerifiedBy(admin);
        }
        return toResponse(review, true);
    }

    private Admin requireAdmin(String username) {
        return accounts.findAdmin(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required."));
    }

    private Review lockReview(int reviewId) {
        return reviews.findForUpdate(reviewId).orElseThrow(ReviewService::reviewNotFound);
    }

    private Location lockLocation(int locationId) {
        return locations.findForUpdate(locationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location was not found."));
    }

    private void requireNoReviewAtLocation(User user, Location location) {
        if (reviews.existsByUser_UserIdAndLocation_LocationIdAndStatusNot(
                user.getUserId(), location.getLocationID(), ReviewStatus.REJECTED)) {
            throw conflict("You already have a review for this location.");
        }
    }

    private Optional<Location> matchingLocation(ReviewLocationProposal proposal) {
        return locations.findMatchingLocations(proposal.getName(), proposal.getCountry(), proposal.getProvince(),
                proposal.getCity(), proposal.getBarangay()).stream().findFirst();
    }

    private Location createLocation(ReviewLocationProposal proposal) {
        Location location = new Location();
        location.setName(proposal.getName());
        location.setCountry(proposal.getCountry());
        location.setProvince(proposal.getProvince());
        location.setCity(proposal.getCity());
        location.setBarangay(proposal.getBarangay());
        return locations.save(location);
    }

    private static void verify(Review review, Admin verifier) {
        review.getLocation().getTags().addAll(review.getTags());
        review.setStatus(ReviewStatus.VERIFIED);
        review.setVerifiedBy(verifier);
    }

    private Set<Tag> resolveTags(List<String> codes) {
        if (codes == null || codes.isEmpty()) {
            throw badRequest("Select at least one tag.");
        }
        Set<String> normalizedCodes = new HashSet<>();
        for (String code : codes) {
            normalizedCodes.add(requireLine(code, "tagCode", 4));
        }
        List<Tag> selected = tags.findAllById(normalizedCodes);
        if (selected.size() != normalizedCodes.size()) {
            throw badRequest("One or more tag codes are unknown.");
        }
        return new HashSet<>(selected);
    }

    private static ReviewLocationProposal normalizeProposal(NewLocation newLocation) {
        Address address = newLocation.address();
        if (address == null) {
            throw badRequest("A proposed location requires an address.");
        }
        return new ReviewLocationProposal(
                requireLine(newLocation.name(), "location name", 255),
                requireLine(address.country(), "country", 25),
                requireLine(address.province(), "province", 255),
                requireLine(address.city(), "city", 255),
                requireLine(address.barangay(), "barangay", 255));
    }

    private static int requireWholeNumber(BigDecimal value, int minimum, int maximum, String field) {
        if (value != null && value.compareTo(BigDecimal.valueOf(minimum)) >= 0
                && value.compareTo(BigDecimal.valueOf(maximum)) <= 0 && value.stripTrailingZeros().scale() <= 0) {
            return value.intValueExact();
        }
        throw badRequest(field + " must be a whole number from " + minimum + " to " + maximum + ".");
    }

    private static String normalizeLine(String value) {
        if (value == null) {
            return "";
        }
        return WHITESPACE.matcher(Normalizer.normalize(value, Normalizer.Form.NFKC))
                .replaceAll(" ").strip();
    }

    private static String requireLine(String value, String field, int maxLength) {
        String normalized = normalizeLine(value);
        if (normalized.isEmpty() || normalized.length() > maxLength
                || normalized.codePoints().anyMatch(Character::isISOControl)) {
            throw badRequest(field + " must contain 1 to " + maxLength + " valid characters.");
        }
        return normalized;
    }

    private static String normalizeReviewText(String value) {
        if (value == null) {
            return null;
        }
        String text = Normalizer.normalize(value, Normalizer.Form.NFKC).strip();
        if (text.length() > 2_000 || text.indexOf(0) >= 0) {
            throw badRequest("writtenReview must contain at most 2000 valid characters.");
        }
        return text.isEmpty() ? null : text;
    }

    private static PageRequest pageRequest(int page, Sort sort) {
        if (page < 0 || page > Integer.MAX_VALUE / PAGE_SIZE) {
            throw badRequest("Invalid page number.");
        }
        return PageRequest.of(page, PAGE_SIZE, sort);
    }

    private static ReviewResponseDTO toResponse(Review review, boolean includeProposal) {
        Location location = review.getLocation();
        ReviewLocationProposal proposal = review.getProposedLocation();
        NewLocation details = null;
        if (includeProposal && proposal != null) {
            details = new NewLocation(proposal.getName(),
                    new Address(proposal.getCountry(), proposal.getProvince(), proposal.getCity(), proposal.getBarangay()));
        }
        String locationName = location != null ? location.getLocName() : details == null ? null : details.name();
        User author = review.getUser();
        return new ReviewResponseDTO(review.getReviewID(), location == null ? null : location.getLocationID(),
                locationName, details, author == null ? null : author.getUsername(),
                review.getTags().stream().map(tag -> tag.getCode().strip()).sorted().toList(),
                review.getEnjoymentRating(), review.getBudgetRating(), review.getWrittenReview(),
                review.getStatus(), review.getCreationDate());
    }

    private static ResponseStatusException reviewNotFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Review was not found.");
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
