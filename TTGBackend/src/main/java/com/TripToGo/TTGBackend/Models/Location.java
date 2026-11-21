package com.TripToGo.TTGBackend.Models;

import java.util.Set;
import java.util.HashSet;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity 
@NoArgsConstructor @AllArgsConstructor 
@Table (name = "locations")
public class Location {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column (name = "location_id")
    private Integer locationId;

    @Column (name = "location_name")
    private String locName;

    @Column (name = "country", length = 25, nullable = false)
    private String country;

    @Column (name = "province", nullable = false)
    private String province;
    
    @Column (name = "city")
    private String city;

    @Column (name = "barangay")
    private String barangay;

    @Column (name = "location_description")
    private String description;

    @Column (name = "enjoyment_rating")
    private float enojymentRating = 0.0f;

    @Column (name = "budget_rating")
    private float budgetRating = 0.0f;

    @ManyToMany 
    @JoinTable (
        name = "location_tags",
        joinColumns = @JoinColumn (name = "location_id"),
        inverseJoinColumns = @JoinColumn (name = "tag_code")

    )
    private Set<Tag> tags = new HashSet<>();

    @OneToMany (mappedBy = "location", cascade = CascadeType.ALL)
    private List<Review> reviews;

    // Getters
    public Integer getLocationID() { return locationId; }
    public String getLocName() { return locName; }
    public String getCountry() { return country; }
    public String getProvince() { return province; }
    public String getCity() { return city; }
    public String getBarangay() { return barangay; }
    public String getDescription() { return description; }
    public float getEnjoymentRating() { return  enojymentRating; }
    public float getBudgetRating() { return budgetRating; }
    public Set<Tag> getTags() {return tags; }

    // Setters
    public void setName(String locName) {this.locName = locName;}
    public void setCountry(String country) {this.country = country;}
    public void setProvince(String province) {this.province = province;}
    public void setCity(String city) {this.city = city;}
    public void setBarangay(String barangay) {this.barangay=barangay;}
    public void setDescription(String description) {this.description=description;}
    public void setTags(Set<Tag> tags) {this.tags = tags; }
}
