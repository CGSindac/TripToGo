
package com.TripToGo.TTGBackend.DTOs.UserDTOs;

import java.time.LocalDateTime;

/** Account profile returned by the user management API. */
public class UserDTO {

    private Integer userId;
    private String username;
    private String email;
    private String role;
    private LocalDateTime creationDate;

    public UserDTO() {
    }

    public UserDTO(Integer userId, String username, String email, String role, LocalDateTime creationDate) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.creationDate = creationDate;
    }

    // Getters
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

    // Setters
    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }
}
