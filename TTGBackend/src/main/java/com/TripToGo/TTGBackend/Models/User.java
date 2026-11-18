package com.TripToGo.TTGBackend.Models;

import java.time.LocalDateTime;

import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity 
@Table (name = "users")
public class User {

    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column (name = "user_id")
    private Integer userId;
    
    @Column (length = 50, nullable = false, unique = true) 
    private String username;

    @Column (name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column (length = 100, nullable = false, unique = true)
    private String email;

    @Column (name = "role_category", length = 20, nullable = false)
    private String role = "User"; // TODO: Implement ENUM for roles

    @CreationTimestamp 
    @Column (name = "created_at", nullable = false, updatable = false)
    private LocalDateTime creationDate;

    @OneToMany (mappedBy = "user")
    private List<Review> authoredReviews;

    @OneToMany (mappedBy = "verifiedBy")
    private List<Review> verifiedReviews;

    // Getters
    public Integer getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getEmail() {return email; }
    public String getRole() {return role; }
    public LocalDateTime getCreationDate() { return creationDate; }

    // Setters
    public void setUsername(String username) { this.username = username; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(String role) { this.role = role; }

}
