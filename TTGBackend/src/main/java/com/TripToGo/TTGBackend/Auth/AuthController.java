package com.TripToGo.TTGBackend.Auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController 
public class AuthController {
    
    @GetMapping("/auth/health")
    public String healthCheck()
    {
        return "Users Endpoint healthy";
    }
}   
