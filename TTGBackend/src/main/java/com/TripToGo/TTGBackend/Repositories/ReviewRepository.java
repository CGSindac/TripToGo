package com.TripToGo.TTGBackend.Repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import com.TripToGo.TTGBackend.Models.Location;
import com.TripToGo.TTGBackend.Models.Review;

import jakarta.persistence.LockModeType;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    @EntityGraph(attributePaths = "user")
    Page<Review> findByLocationAndStatus(Location location, String status, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "location"})
    Page<Review> findByStatus(String status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Review> findByReviewID(Integer reviewId);
}
