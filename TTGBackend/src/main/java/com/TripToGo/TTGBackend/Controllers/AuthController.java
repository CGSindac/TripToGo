package com.TripToGo.TTGBackend.Controllers;

import java.net.URI;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.TripToGo.TTGBackend.DTOs.CsrfTokenResponseDTO;
import com.TripToGo.TTGBackend.DTOs.LoginResponseDTO;
import com.TripToGo.TTGBackend.DTOs.UserLoginDTO;
import com.TripToGo.TTGBackend.DTOs.UserRegistrationDTO;
import com.TripToGo.TTGBackend.DTOs.UserResponseDTO;
import com.TripToGo.TTGBackend.Services.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController 
public class AuthController {

    private final AuthService authService;
    private final SecurityContextRepository securityContexts;
    private final SessionAuthenticationStrategy loginSessionStrategy;

    public AuthController(AuthService authService, SecurityContextRepository securityContexts,
            SessionAuthenticationStrategy loginSessionStrategy) {
        this.authService = authService;
        this.securityContexts = securityContexts;
        this.loginSessionStrategy = loginSessionStrategy;
    }

    @GetMapping("/auth/health")
    public String healthCheck()
    {
        return "Users Endpoint healthy";
    }

    @GetMapping("/auth/csrf")
    public CsrfTokenResponseDTO csrf(CsrfToken token) {
        return new CsrfTokenResponseDTO(token.getHeaderName(), token.getParameterName(), token.getToken());
    }

    @PostMapping(path = "/auth/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserRegistrationDTO registration) {
        UserResponseDTO user = authService.register(registration);
        return ResponseEntity.created(URI.create("/users/" + user.userId())).body(user);
    }

    @PostMapping(path = "/auth/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public LoginResponseDTO login(@RequestBody UserLoginDTO credentials, HttpServletRequest request,
            HttpServletResponse response) {
        LoginResponseDTO login = authService.login(credentials);
        // Store only the account ID in the session. The service checks its current role on each account request.
        var authentication = UsernamePasswordAuthenticationToken.authenticated(login.user().userId(), null, List.of());
        loginSessionStrategy.onAuthentication(authentication, request, response);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContexts.saveContext(context, request, response);
        return login;
    }
}
