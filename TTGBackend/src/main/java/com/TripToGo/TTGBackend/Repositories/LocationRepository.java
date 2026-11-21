package com.TripToGo.TTGBackend.Repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.TripToGo.TTGBackend.Models.Location;

public interface LocationRepository extends JpaRepository<Location, Integer> {

    @Query("""
            select location from Location location
            where (:query = '' or locate(lower(:query), lower(location.locName)) > 0)
              and (:tagCode = '' or exists (
                  select tag.code from Location tagged join tagged.tags tag
                  where tagged = location and tag.code = :tagCode
              ))
            """)
    Page<Location> findLocations(@Param("query") String query, @Param("tagCode") String tagCode, Pageable pageable);

    @Query("""
            select location from Location location
            where exists (select tag.code from Location tagged join tagged.tags tag
                          where tagged = location and tag.code in :tagCodes)
            """)
    List<Location> findByPreferredTags(@Param("tagCodes") List<String> tagCodes, Pageable pageable);
}
