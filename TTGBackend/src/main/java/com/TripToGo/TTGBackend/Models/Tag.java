package com.TripToGo.TTGBackend.Models;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity 
@Table (name = "tags")
public class Tag {

    @Id 
    @Column (name = "tag_code", length = 4, nullable = false, columnDefinition = "CHAR(4)")
    private String code;

    @Column (name = "tag_name", length = 25, nullable = false)
    private String name;

    @Column (name = "tag_description")
    private String description;

    // TODO: Map Many-To-Many Relationship with Location
    @ManyToMany (mappedBy = "tags")   
    private Set<Location> locations = new HashSet<>();

    // Getters
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDescription() {return description; }
    public Set<Location> getLocations() {return locations;}

    // Setters
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setLocations(Set<Location> locations) { this.locations = locations; }
}
