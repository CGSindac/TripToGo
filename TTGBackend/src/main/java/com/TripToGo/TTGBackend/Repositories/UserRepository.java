package com.TripToGo.TTGBackend.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TripToGo.TTGBackend.Models.User;


public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUsername(String username);
} 
