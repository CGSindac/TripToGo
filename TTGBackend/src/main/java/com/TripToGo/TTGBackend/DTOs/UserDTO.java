
package com.TripToGo.TTGBackend.DTOs;

import java.time.LocalDateTime;

import com.TripToGo.TTGBackend.Models.User;

public class UserDTO {

    private Integer userId;
    private String username;
    private String email;
    private String role;
    private LocalDateTime creationDate;
   

    // Constructor
    public UserDTO(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.creationDate = user.getCreationDate();
    }

    // Getters
     // password_hash is removed since it is secured h
    public Integer getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }
}
