package com.TripToGo.TTGBackend.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.TripToGo.TTGBackend.Models.Trip;

public interface TripRepository extends JpaRepository<Trip, Integer>{
    
}
