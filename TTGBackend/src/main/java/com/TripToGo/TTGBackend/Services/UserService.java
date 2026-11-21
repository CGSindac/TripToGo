package com.TripToGo.TTGBackend.Services;

import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.PageQueryDTO;
import com.TripToGo.TTGBackend.DTOs.PageResponseDTO;
import com.TripToGo.TTGBackend.DTOs.UserRegistrationDTO;
import com.TripToGo.TTGBackend.DTOs.UserResponseDTO;
import com.TripToGo.TTGBackend.DTOs.UserUpdateDTO;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.UserRepository;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    UserResponseDTO createAccount(UserRegistrationDTO request, String passwordHash) {
        User user = new User();
        user.setUsername(request.username().strip());
        user.setEmail(request.email());
        user.setPasswordHash(passwordHash);
        user.setRole("USER");
        return saveProfile(user);
    }

    public PageResponseDTO<UserResponseDTO> listUsers(Integer actorId, PageQueryDTO page) {
        requireAdministrator(actorId);
        PageRequest pageRequest = PageRequest.of(page.page(), page.size(), Sort.by("userId"));
        return PageResponseDTO.from(userRepository.findAll(pageRequest).map(UserService::toResponse));
    }

    public UserResponseDTO getUser(Integer actorId, Integer userId) {
        User actor = requireActor(actorId);
        if (actorId.equals(userId)) {
            return toResponse(actor);
        }
        requireAdmin(actor);
        return toResponse(findUser(userId));
    }

    @Transactional
    public UserResponseDTO updateUser(Integer actorId, Integer userId, UserUpdateDTO request) {
        User user;
        if (actorId != null && actorId.equals(userId)) {
            user = userRepository.findForUpdate(userId).orElseThrow(UserService::signInRequired);
        } else {
            requireAdministrator(actorId);
            user = userRepository.findForUpdate(userId).orElseThrow(UserService::userNotFound);
        }
        if (request.username() != null) {
            user.setUsername(request.username().strip());
        }
        if (request.email() != null) {
            user.setEmail(request.email());
        }
        return saveProfile(user);
    }

    @Transactional
    public void deleteUser(Integer actorId, Integer userId) {
        requireAdministrator(actorId);
        User user = findUser(userId);
        try {
            userRepository.delete(user);
            userRepository.flush();
        } catch (DataIntegrityViolationException referencedAccount) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Account is referenced by existing records");
        }
    }

    private UserResponseDTO saveProfile(User user) {
        try {
            return toResponse(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException duplicateAccount) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username or email is already in use");
        }
    }

    User requireAdministrator(Integer actorId) {
        User actor = requireActor(actorId);
        requireAdmin(actor);
        return actor;
    }

    User requireActor(Integer actorId) {
        if (actorId == null) {
            throw signInRequired();
        }
        return userRepository.findById(actorId).orElseThrow(UserService::signInRequired);
    }

    private static void requireAdmin(User actor) {
        if (!"ADMIN".equalsIgnoreCase(actor.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access is required");
        }
    }

    private User findUser(Integer userId) {
        return userRepository.findById(userId).orElseThrow(UserService::userNotFound);
    }

    private static ResponseStatusException signInRequired() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in is required");
    }

    private static ResponseStatusException userNotFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }

    static UserResponseDTO toResponse(User user) {
        return new UserResponseDTO(user.getUserId(), user.getUsername(), user.getEmail(),
                user.getRole().toUpperCase(Locale.ROOT), user.getCreationDate());
    }
}
