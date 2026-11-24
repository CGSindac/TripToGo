package com.TripToGo.TTGBackend.Controllers;

import org.springframework.web.bind.annotation.RestController;

import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserDTO;
import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserRegisterDTO;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Services.UserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


// import com.TripToGo.TTGBackend.DTOs.UserDTO;
// import com.TripToGo.TTGBackend.DTOs.UserUpdateDTO;


@RestController 
@RequestMapping ("/users")
public class Usercontroller {

    private final UserService userService;


    public Usercontroller (
        UserService userService
    )
    {
        this.userService = userService;
    }

    // Health Check For /users Path
    @GetMapping("/health")
    public String healthCheck()
    {
        return "Auth Endpoint healthy";
    }

    // Get List of Users
    // May take query parametrs of the ff.
    // 'page' - current page
    // 'size' - next s papers from 'page'
    // 'sortBy' - configures the sort parameter, can be the ff. ['username', 'user_id', ]
    @GetMapping ("/all")
    public Page<User> getUsers(
        @RequestParam (defaultValue = "0") int page,
        @RequestParam (defaultValue = "5" ) int limit,
        @RequestParam (defaultValue = "username") String sortBy, 
        @RequestParam (defaultValue = "true") boolean asc
    )
    {   

        Sort sort = asc ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, limit, sort);
        return userService.getAll(pageable);
    }

    // Get a user
    @GetMapping ("")
    public User getUser(
        @RequestParam Integer id
    )
    {   
        return userService.getSingleUser(id);
    }

    // Create new user
    @PostMapping ("/new")
    public User newUser(
        @RequestBody UserRegisterDTO request
    )
    {
        return userService.createUser(request);
    }

    // Deletes a user
    // requires a query parameter 'id' representing a user's id
    @DeleteMapping ("/delete")
    public User deleteUser(
        @RequestParam Integer id
    )
    {   
        return userService.deleteUser(id);
    }


    // Update user
    @PutMapping ()
    public User updateUser(
        @RequestBody UserDTO userDTO
    )
    {   
        return userService.updateUser(null);
    }
}
