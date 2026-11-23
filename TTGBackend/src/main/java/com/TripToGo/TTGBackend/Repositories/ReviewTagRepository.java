package com.TripToGo.TTGBackend.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.TripToGo.TTGBackend.Models.Tag;

public interface ReviewTagRepository extends JpaRepository<Tag, String> {
    List<Tag> findAllByOrderByNameAscCodeAsc();
}
