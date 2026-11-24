package com.TripToGo.TTGBackend.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import com.TripToGo.TTGBackend.Models.Admin;
import com.TripToGo.TTGBackend.Models.User;

import jakarta.persistence.LockModeType;

public interface ReviewAccountRepository extends Repository<User, Integer> {
    Optional<User> findByUsername(String username);

    @Query("select a from Admin a where a.user.username = :username")
    Optional<Admin> findAdmin(String username);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.username = :username")
    Optional<User> findForUpdate(String username);
}
