package com.TripToGo.TTGBackend.Repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserDTO;
import com.TripToGo.TTGBackend.Models.User;

import jakarta.persistence.LockModeType;

public interface UserRepository extends JpaRepository<User, Integer> {
    /** Selects profile fields and roles together for the account list. */
    @Query(value = """
            select new com.TripToGo.TTGBackend.DTOs.UserDTOs.UserDTO(
                u.userId, u.username, u.email, case when a.id is null then 'USER' else 'ADMIN' end,
                u.creationDate)
            from User u left join Admin a on a.user = u
            """, countQuery = "select count(u) from User u")
    Page<UserDTO> findProfiles(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.userId = :userId")
    Optional<User> findForUpdate(Integer userId);
}
