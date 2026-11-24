package com.TripToGo.TTGBackend.Models;

import java.util.Locale;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
public class ReviewLocationProposal {
    @Column(name = "proposed_location_name")
    private String name;

    @Column(name = "proposed_country", length = 25)
    private String country;

    @Column(name = "proposed_province")
    private String province;

    @Column(name = "proposed_city")
    private String city;

    @Column(name = "proposed_barangay")
    private String barangay;

    @Column(name = "proposed_location_key", columnDefinition = "TEXT")
    private String key;

    public ReviewLocationProposal(String name, String country, String province, String city, String barangay) {
        this.name = name;
        this.country = country;
        this.province = province;
        this.city = city;
        this.barangay = barangay;
        this.key = String.join("\n", name, country, province, city, barangay).toLowerCase(Locale.ROOT);
    }
}
