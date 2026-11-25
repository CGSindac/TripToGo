package com.TripToGo.TTGBackend.Repositories.ReviewRepo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.TripToGo.TTGBackend.Models.Location;

import jakarta.persistence.LockModeType;

public interface ReviewLocationRepository extends JpaRepository<Location, Integer> {
    Page<Location> findByLocNameContainingIgnoreCase(String name, Pageable page);

    Page<Location> findDistinctByLocNameContainingIgnoreCaseAndTags_Code(String name, String code, Pageable page);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from Location l where l.locationId = :locationId")
    Optional<Location> findForUpdate(Integer locationId);

    @Query("""
            select l from Location l
            where lower(l.locName) = lower(:name)
                and lower(l.country) = lower(:country)
                and lower(l.province) = lower(:province)
                and lower(l.city) = lower(:city)
                and lower(l.barangay) = lower(:barangay)
            order by l.locationId
            """)
    List<Location> findMatchingLocations(String name, String country, String province, String city, String barangay);
}
