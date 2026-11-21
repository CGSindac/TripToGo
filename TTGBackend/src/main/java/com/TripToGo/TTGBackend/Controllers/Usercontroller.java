package com.TripToGo.TTGBackend.Controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.TripToGo.TTGBackend.DTOs.PageQueryDTO;
import com.TripToGo.TTGBackend.DTOs.PageResponseDTO;
import com.TripToGo.TTGBackend.DTOs.UserResponseDTO;
import com.TripToGo.TTGBackend.DTOs.UserUpdateDTO;
import com.TripToGo.TTGBackend.Services.UserService;

@RestController 
public class Usercontroller {

    private final UserService userService;

    public Usercontroller(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/health")
    public String healthCheck()
    {
        return "Auth Endpoint healthy";
    }

    @GetMapping("/users")
    public PageResponseDTO<UserResponseDTO> listUsers(@AuthenticationPrincipal Integer actorId,
            @Validated @ModelAttribute("pageQuery") PageQueryDTO page) {
        return userService.listUsers(actorId, page);
    }

    @GetMapping("/users/{userId}")
    public UserResponseDTO getUser(@AuthenticationPrincipal Integer actorId, @PathVariable("userId") Integer userId) {
        return userService.getUser(actorId, userId);
    }

    @PatchMapping(path = "/users/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public UserResponseDTO updateUser(@AuthenticationPrincipal Integer actorId, @PathVariable("userId") Integer userId,
            @RequestBody UserUpdateDTO update) {
        return userService.updateUser(actorId, userId, update);
    }

    @DeleteMapping("/users/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@AuthenticationPrincipal Integer actorId, @PathVariable("userId") Integer userId) {
        userService.deleteUser(actorId, userId);
    }
}
