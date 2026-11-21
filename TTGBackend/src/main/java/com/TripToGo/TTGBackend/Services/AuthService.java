package com.TripToGo.TTGBackend.Services;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.LoginResponseDTO;
import com.TripToGo.TTGBackend.DTOs.UserLoginDTO;
import com.TripToGo.TTGBackend.DTOs.UserRegistrationDTO;
import com.TripToGo.TTGBackend.DTOs.UserResponseDTO;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwords;
    private final String dummyHash;

    public AuthService(UserRepository userRepository, UserService userService, PasswordEncoder passwords) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwords = passwords;
        this.dummyHash = passwords.encode(UUID.randomUUID().toString());
    }

    @Transactional
    public UserResponseDTO register(UserRegistrationDTO request) {
        return userService.createAccount(request, passwords.encode(request.password()));
    }

    public LoginResponseDTO login(UserLoginDTO request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        // Do comparable password work for an unknown account and always return the same error.
        String hash = user == null ? dummyHash : user.getPasswordHash();
        boolean matches = matchesPassword(request.password(), hash);
        if (user == null || !matches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return new LoginResponseDTO(UserService.toResponse(user));
    }

    private boolean matchesPassword(String password, String hash) {
        try {
            return passwords.matches(password, hash);
        } catch (IllegalArgumentException | IndexOutOfBoundsException invalidHash) {
            passwords.matches(password, dummyHash);
            return false;
        }
    }
}
