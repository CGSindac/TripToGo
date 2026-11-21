package com.TripToGo.TTGBackend.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.TripToGo.TTGBackend.Models.Tag;

public interface TagRepository extends JpaRepository<Tag, String> {
}
