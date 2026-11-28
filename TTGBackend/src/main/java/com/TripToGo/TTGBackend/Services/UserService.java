package com.TripToGo.TTGBackend.Services;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserResponseDTO;
import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserRegisterDTO;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.UserRepository;
import jakarta.transaction.Transactional;

@Service 
public class UserService {
    private static final String HASH_PREFIX = "{pbkdf2}";
    private static final Pbkdf2PasswordEncoder PASSWORDS = Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    
    private final UserRepository userRepository;
    
    public UserService(
        UserRepository userRepository
    )
    {
        this.userRepository = userRepository;
    }

    // Retrieves a single user and outputs all of their information except for their password
    public User getSingleUser(
        Integer id
    )
    {
        return userRepository.findById(id)
                .orElse(null);
    }

    // 
    public Page<User> getAll(Pageable pageable)
    {   
       return userRepository.findAll(pageable);
    }
    
    // Uploads a new user to the database
    // Requires UserRegisterDTO that contains the ff.
    // username, email, password
    @Transactional
    public User createUser(
        UserRegisterDTO newUser
    )
    {
        if (newUser == null || newUser.getUsername() == null || newUser.getEmail() == null
                || newUser.getPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username, email, and password are required.");
        }
        String username = newUser.getUsername().strip();
        String email = newUser.getEmail().strip();
        String password = newUser.getPassword();
        if (!username.matches("[A-Za-z0-9_.]{3,50}") || email.length() > 100
                || !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")
                || password.length() < 8 || password.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid username, email, and password.");
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(encodePassword(password));
        try {
            return userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That username or email is already taken.");
        }
    }

    @Transactional
    public User authenticate(String login, String password) {
        if (login == null || password == null || password.length() > 255) {
            throw invalidLogin();
        }
        String identifier = login.strip();
        User user = (identifier.contains("@") ? userRepository.findByEmail(identifier)
                : userRepository.findByUsername(identifier)).filter(User::isActive).orElseThrow(UserService::invalidLogin);
        String stored = user.getPasswordHash();
        if (stored.startsWith(HASH_PREFIX)) {
            if (!PASSWORDS.matches(password, stored.substring(HASH_PREFIX.length()))) throw invalidLogin();
        } else {
            // Earlier versions stored passwords directly. Upgrade them after a successful login.
            if (!stored.equals(password)) throw invalidLogin();
            user.setPasswordHash(encodePassword(password));
        }
        return user;
    }

    private static String encodePassword(String password) {
        return HASH_PREFIX + PASSWORDS.encode(password);
    }

    private static ResponseStatusException invalidLogin() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect email, username, or password.");
    }

    @Transactional 
    public User deleteUser(Integer id)
    {
        User user = userRepository.findById(id)
                    .orElse(null);

        if (user == null) return null;

        // Set information to arbitrary information
        user.setEmail("[DELETED]");
        user.setUsername("[DELETED]");
        user.setPasswordHash("[DELETEED]"); // NOTE: Reencrypt without storing the hash so that It can never be reconstructed
        user.setActive(false);

        return userRepository.save(user);
    }

    @Transactional 
    public User updateUser(UserResponseDTO newUser)
    {
        User user = userRepository.findById(newUser.getUserID()).orElse(null);

        if (user == null) return null; 

        user.setUsername(newUser.getUsername());
        user.setEmail(newUser.getEmail());

        return userRepository.save(user);
    }

    
}
