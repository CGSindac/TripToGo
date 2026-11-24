package com.TripToGo.TTGBackend.Models;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity 
@NoArgsConstructor
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

    @Embedded
    private ReviewLocationProposal proposedLocation;

    @ManyToMany
    @JoinTable(name = "review_tags",
            joinColumns = @JoinColumn(name = "review_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_code"))
    private Set<Tag> tags = new HashSet<>();

    @Column (name = "enjoyment_rating", nullable = false)
    private int enjoymentRating;

    @Column (name = "budget_rating", nullable = false)
    private int budgetRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "stat", length = 20)
    private ReviewStatus status = ReviewStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_admin_id")
    private Admin verifiedBy;

    @Column(name = "written_review", columnDefinition = "TEXT")
    private String writtenReview;

    @CreationTimestamp 
    @Column (name = "created_at")
    private LocalDateTime creationDate;


    // Getters
    public Integer getReviewID() { return reviewID; }
    public int getEnjoymentRating() { return enjoymentRating; }
    public int getBudgetRating() { return budgetRating; }
    public ReviewStatus getStatus() { return status; }
    public String getWrittenReview() { return writtenReview; }
    public LocalDateTime getCreationDate() { return creationDate; }
    public User getUser() { return user; }
    public Location getLocation() { return location; }
    public ReviewLocationProposal getProposedLocation() { return proposedLocation; }
    public Set<Tag> getTags() { return tags; }
    public Admin getVerifiedBy() { return verifiedBy; }

    // Setters
    public void setEnjoymentRating(int enjoymentRating) { this.enjoymentRating = enjoymentRating; }
    public void setBudgetRating(int budgetRating) {this.budgetRating = budgetRating; }
    public void setStatus(ReviewStatus status) { this.status = status; }
    public void setWrittenReview(String writtenReview) { this.writtenReview = writtenReview; }
    public void setUser(User user) { this.user = user; }
    public void setLocation(Location location) {this.location = location; }
    public void setProposedLocation(ReviewLocationProposal proposedLocation) { this.proposedLocation = proposedLocation; }
    public void addTags(Set<Tag> tags) { this.tags.addAll(tags); }
    public void setVerifiedBy(Admin verifiedBy ) { this.verifiedBy = verifiedBy;}
}
