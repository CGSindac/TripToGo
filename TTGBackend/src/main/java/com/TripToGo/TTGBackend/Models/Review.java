package com.TripToGo.TTGBackend.Models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity 
@NoArgsConstructor @AllArgsConstructor 
@Table (name = "reviews")
public class Review {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column (name = "review_id")
    private Integer reviewID;
    
    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "user_id")
    private User user;

    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "location_id")
    private Location location;

    @Column (name = "enjoyment_rating", nullable = false)
    private int enojymentRating;

    @Column (name = "budget_rating", nullable = false)
    private int budgetRating;

    @Column (name = "stat", length = 4)
    private String status = "PENDING"; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private Admin verifiedBy;

    @Column (name = "written_review")
    private String writtenReview;

    @CreationTimestamp 
    @Column (name = "created_at")
    private LocalDateTime creationDate;


    // Getters
    public Integer getReviewID() { return reviewID; }
    public int getEnjoymentRating() { return enojymentRating; }
    public int getBudgetRating() { return budgetRating; }
    public String getStatus() { return status; }
    public String getWrittenReview() { return writtenReview; }
    public LocalDateTime getCreationDate() { return creationDate; }
    public User getUser() { return user; }
    public Location getLocation() { return location; }
    public Admin getVerifiedBy() { return verifiedBy; }

    // Setters
    public void setEnjoymentRating(int enojymentRating) { this.enojymentRating = enojymentRating; }
    public void setBudgetRating(int budgetRating) {this.budgetRating = budgetRating; }
    public void setStatus(String status) { this.status = status; }
    public void setWrittenReview(String writtenReview) { this.writtenReview = writtenReview; }
    public void setUser(User user) { this.user = user; }
    public void setLocation(Location location) {this.location = location; }
    public void setVerifiedBy(Admin verifiedBy ) { this.verifiedBy = verifiedBy;}
}
