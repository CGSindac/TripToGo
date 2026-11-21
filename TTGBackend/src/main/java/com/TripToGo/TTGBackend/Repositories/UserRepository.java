package com.TripToGo.TTGBackend.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.TripToGo.TTGBackend.Models.User;

import jakarta.persistence.LockModeType;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    // Serialize profile updates so overlapping PATCH requests do not overwrite unrelated fields.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from User account where account.userId = :userId")
    Optional<User> findForUpdate(@Param("userId") Integer userId);
}
