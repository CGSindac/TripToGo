package com.TripToGo.TTGBackend.Services;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserRegisterDTO;
import com.TripToGo.TTGBackend.Models.User;

@Service
public class AuthService {
    private static final Duration SESSION_DURATION = Duration.ofHours(12);

    private record Session(int userId, Instant expiresAt) {}

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();
    private final UserService users;

    public AuthService(UserService users) {
        this.users = users;
    }

    public String login(String login, String password) {
        return startSession(users.authenticate(login, password));
    }

    public String register(UserRegisterDTO request) {
        return startSession(users.createUser(request));
    }

    private String startSession(User user) {
        Instant now = Instant.now();
        sessions.values().removeIf(session -> !session.expiresAt().isAfter(now));
        String token = UUID.randomUUID().toString();
        sessions.put(token, new Session(user.getUserId(), now.plus(SESSION_DURATION)));
        return token;
    }

    public User requireUser(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            Session session = sessions.get(authorization.substring(7));
            if (session != null && session.expiresAt().isAfter(Instant.now())) {
                User user = users.getSingleUser(session.userId());
                if (user != null && user.isActive()) return user;
            }
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in to continue.");
    }
}
