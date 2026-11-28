package com.TripToGo.TTGBackend.Repositories.ReviewRepo;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.TripToGo.TTGBackend.Models.Review;
import com.TripToGo.TTGBackend.Models.ReviewStatus;

import jakarta.persistence.LockModeType;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    interface LocationRatings {
        Integer getLocationId();
        double getEnjoymentRating();
        double getBudgetRating();
    }

    long countByUser_UserIdAndCreationDateAfter(Integer userId, LocalDateTime cutoff);

    boolean existsByUser_UserIdAndLocation_LocationIdAndStatusNot(
            Integer userId, Integer locationId, ReviewStatus excludedStatus);

    boolean existsByUser_UserIdAndProposedLocation_KeyAndStatus(
            Integer userId, String key, ReviewStatus status);

    Page<Review> findByLocation_LocationIdAndStatus(Integer locationId, ReviewStatus status, Pageable page);

    Page<Review> findByUser_UserId(Integer userId, Pageable page);

    boolean existsByLocation_LocationId(Integer locationId);

    @Query("""
            select r.location.locationId as locationId, avg(r.enjoymentRating) as enjoymentRating,
                avg(r.budgetRating) as budgetRating
            from Review r
            where r.location.locationId in :locationIds and r.status = :status
            group by r.location.locationId
            """)
    List<LocationRatings> averageLocationRatings(Collection<Integer> locationIds, ReviewStatus status);

    Page<Review> findByStatusIn(Collection<ReviewStatus> statuses, Pageable page);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Review r where r.reviewID = :reviewId")
    Optional<Review> findForUpdate(Integer reviewId);
}
