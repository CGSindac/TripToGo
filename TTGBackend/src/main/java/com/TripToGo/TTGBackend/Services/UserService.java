package com.TripToGo.TTGBackend.Services;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserDTO;
import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserRegisterDTO;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.UserRepository;
import jakarta.transaction.Transactional;

@Service 
public class UserService {
    
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
        User user = new User();
        
        // TODO: Add password hashing function before saving to Database

        user.setUsername(newUser.getUsername());
        user.setEmail(newUser.getEmail());
        user.setPasswordHash(newUser.getPassword());

        return userRepository.save(user);
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
    public User updateUser(UserDTO newUser)
    {
        User user = userRepository.findById(newUser.getUserID()).orElse(null);

        if (user == null) return null; 

        user.setUsername(newUser.getUsername());
        user.setEmail(newUser.getEmail());

        return userRepository.save(user);
    }

    
}
