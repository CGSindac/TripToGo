package com.TripToGo.TTGBackend.Controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


// import com.TripToGo.TTGBackend.DTOs.UserDTO;
// import com.TripToGo.TTGBackend.DTOs.UserUpdateDTO;


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
