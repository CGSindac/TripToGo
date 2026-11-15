package com.TripToGo.TTGBackend.Location;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


/**
 *  
 *  Each location has data (Refer to project documentation).
 * 
*/

@RestController 
public class LocationContoller {

    @GetMapping("/location/health")
    public String healthCheck()
    {
        return "Location endpoint healthy";
    }

    // Get a location
    @GetMapping("/locations/s/{location-id}")
    public String getLocation(
        @PathVariable("location-id") String locationId
    ) {
        return "Location ID: " + locationId;
    }
 
    // Get a list of location based on query parameters

    // Get a location's review

    // Create new locatoin

    // Update a location's information

    // Delete a location


}
