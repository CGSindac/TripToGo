package com.TripToGo.TTGBackend.User;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController 
public class Usercontroller {


    @GetMapping("/users/health")
    public String healthCheck()
    {
        return "Auth Endpoint healthy";
    }

    // Get List of Users

    // Get a user

    // Create new user

    // Delete user

    // Update user
}
