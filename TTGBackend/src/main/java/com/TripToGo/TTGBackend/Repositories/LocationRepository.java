package com.TripToGo.TTGBackend.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.TripToGo.TTGBackend.Models.Location;

public interface LocationRepository extends JpaRepository<Location, Integer> {
    int LOCATION_LOCK_NAMESPACE = "review location".hashCode();

    @Query(value = "select 1 from pg_advisory_xact_lock(:namespace, :keyHash)", nativeQuery = true)
    Integer acquireAdvisoryLock(@Param("namespace") int namespace, @Param("keyHash") int keyHash);

    default void lockLocationIdentity(String key) {
        acquireAdvisoryLock(LOCATION_LOCK_NAMESPACE, key.hashCode());
    }
}
