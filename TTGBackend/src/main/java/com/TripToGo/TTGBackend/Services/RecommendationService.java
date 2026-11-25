package com.TripToGo.TTGBackend.Services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.Models.Location;
import com.TripToGo.TTGBackend.Models.Trip;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.LocationRepository;
import com.TripToGo.TTGBackend.Repositories.TripRepository;
import com.TripToGo.TTGBackend.Repositories.UserRepository;
import com.TripToGo.TTGBackend.DTOs.LocationDTOs.LocationResponseDTO;
import com.TripToGo.TTGBackend.DTOs.RecommendationDTOs.RecommendationRequestDTO;

@Service 
public class RecommendationService {
    private final LocationService locations;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final int SUGGESTIONSIZE = 5;

    public RecommendationService(
        LocationService locationService,
        LocationRepository locationRepository,
        TripRepository tripRepository,
        UserRepository userRepository
    )
    {
        this.locations = locationService;
        this.locationRepository = locationRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    public List<LocationResponseDTO> generateRecommendation(
        RecommendationRequestDTO request,
        String username
    )
    {
        // Validate Input Fields
        List<LocationResponseDTO> gatheredLocations = locations.browse(null, request.getTags(), 0).getContent();

        // Choose 5 Locations Randomly
        List<LocationResponseDTO> recommendations = recommend(gatheredLocations, SUGGESTIONSIZE);
        
        // Log Trip
        logTrip(username,  extractLocationIds(recommendations));

        return recommendations;
    }

    private List<LocationResponseDTO> recommend(List<LocationResponseDTO> locations, int suggestionSize){
        int locationsCount = locations.size();
        boolean[] chosen = new boolean[locationsCount];  

        if ( locationsCount <= SUGGESTIONSIZE ) return locations;

        List<LocationResponseDTO> suggestedLocations = new ArrayList<>();

        Random rnd = new Random();

        
        for (int i = 0; i < SUGGESTIONSIZE; ++i)
        {
            int randIdx = (rnd.nextInt(locationsCount) % locationsCount);

            while(chosen[randIdx] == true)
            {
                randIdx = (randIdx + 1) % locationsCount;
            }

            chosen[randIdx] = true;
            suggestedLocations.add(locations.get(randIdx));
        }

        return suggestedLocations;
    }
    
    @Transactional 
    private Trip logTrip(String username, List<Integer> locationIds)
    {
        // Retrieve User
        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        HashSet<Location> locations = retrieveLocationDetails(locationIds);

        Trip newTrip = new Trip();

        newTrip.setUser(user);
        newTrip.setLocations(locations);

        return tripRepository.save(newTrip);
    }

    // === UTILS === //
    private List<Integer> extractLocationIds(List<LocationResponseDTO> locations)
    {
        List<Integer> locationIds = new ArrayList<>();

        for (LocationResponseDTO location : locations)
        {
            locationIds.add(location.locationId());
        }

        return locationIds;
    }

    private HashSet<Location> retrieveLocationDetails(List<Integer> locationIds)
    {
        List<Location> locDetails = locationRepository.findAllById(locationIds);

        // Check if empty or not location Ids found
        if (locDetails.isEmpty() || locDetails.size() < locDetails.size())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more locations not found");
        }
        
        return new HashSet<>(locDetails);
    }

}
