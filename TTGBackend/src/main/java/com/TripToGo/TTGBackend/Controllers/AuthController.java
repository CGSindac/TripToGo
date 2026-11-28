package com.TripToGo.TTGBackend.Controllers;

import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserRegisterDTO;
import com.TripToGo.TTGBackend.Services.AuthService;

@RestController 
@CrossOrigin
public class AuthController {
    public record LoginRequest(String login, String password) {}
    public record LoginResponse(String token) {}

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @GetMapping("/auth/health")
    public String healthCheck()
    {
        return "Users Endpoint healthy";
    }

    @PostMapping("/auth/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return new LoginResponse(auth.login(request.login(), request.password()));
    }

    @PostMapping("/auth/register")
    public LoginResponse register(@RequestBody UserRegisterDTO request) {
        return new LoginResponse(auth.register(request));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleAuthError(ResponseStatusException exception) {
        return exception.getBody();
    }
}   
