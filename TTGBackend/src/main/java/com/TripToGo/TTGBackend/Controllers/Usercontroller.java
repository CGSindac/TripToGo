package com.TripToGo.TTGBackend.Controllers;

import java.security.Principal;

import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserDTO;
import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserUpdateDTO;
import com.TripToGo.TTGBackend.Services.UserService;

/** Exposes profile management using the caller identity supplied by the servlet container. */
@RestController
@RequestMapping("/users")
public class Usercontroller {
    private final UserService users;

    public Usercontroller(UserService users) {
        this.users = users;
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "Users endpoint healthy";
    }

    @GetMapping(path = {"", "/all"}, params = "!id")
    public PagedModel<UserDTO> list(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int limit, @RequestParam(defaultValue = "username") String sortBy,
            @RequestParam(defaultValue = "true") boolean asc, Principal principal) {
        return new PagedModel<>(users.list(username(principal), page, limit, sortBy, asc));
    }

    @GetMapping("/{userId}")
    public UserDTO get(@PathVariable int userId, Principal principal) {
        return users.get(userId, username(principal));
    }

    @GetMapping(params = "id")
    public UserDTO getByQueryId(@RequestParam int id, Principal principal) {
        return get(id, principal);
    }

    @PatchMapping(path = "/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public UserDTO update(@PathVariable int userId, @RequestBody UserUpdateDTO request, Principal principal) {
        return users.update(userId, request, username(principal));
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int userId, Principal principal) {
        users.delete(userId, username(principal));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleUserError(ResponseStatusException exception) {
        return exception.getBody();
    }

    private static String username(Principal principal) {
        return principal == null ? null : principal.getName();
    }
}
