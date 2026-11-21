package com.TripToGo.TTGBackend.Models;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Getter @Setter 
@NoArgsConstructor @AllArgsConstructor 
@Table (name = "admins")
public class Admin {
    
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column (name = "admin_id")
    private Integer id;
    
    @OneToOne 
    @JoinColumn (name = "user_id")
    private User user;

    @OneToMany (mappedBy = "verifiedBy")
    private List<Review> verifiedReviews;
}
