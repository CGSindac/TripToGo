package com.TripToGo.TTGBackend.Repositories.ReviewRepo;

import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import com.TripToGo.TTGBackend.Models.Admin;
import com.TripToGo.TTGBackend.Models.User;

import jakarta.persistence.LockModeType;

public interface ReviewAccountRepository extends Repository<User, Integer> {
    Optional<User> findByUserId(Integer userId);

    Optional<User> findByUsername(String username);

    @Query("select a from Admin a where a.user.userId = :userId")
    Optional<Admin> findAdmin(Integer userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.username = :username")
    Optional<User> findForUpdate(String username);
}
