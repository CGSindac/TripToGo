package com.TripToGo.TTGBackend.Services;

import java.sql.SQLException;
import java.util.regex.Pattern;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserDTO;
import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserUpdateDTO;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.UserRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepo.ReviewAccountRepository;

/** Manages account profiles and provisions accounts for trusted backend callers. */
@Service
@Transactional(readOnly = true)
public class UserService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_USERNAME_LENGTH = 50;
    private static final int MAX_EMAIL_LENGTH = 100;
    private static final int MAX_PASSWORD_HASH_LENGTH = 255;
    private static final String UNIQUE_VIOLATION = "23505";
    private static final String FOREIGN_KEY_VIOLATION = "23503";
    private static final Pattern EMAIL = Pattern.compile("[^\\s@]+@[^\\s@]+\\.[^\\s@]+",
            Pattern.UNICODE_CHARACTER_CLASS);

    private final UserRepository users;
    private final ReviewAccountRepository accounts;

    public UserService(UserRepository users, ReviewAccountRepository accounts) {
        this.users = users;
        this.accounts = accounts;
    }

    /** Lists account profiles for administrators with a stable order across pages. */
    public Page<UserDTO> list(String actor, int page, int limit, String sortBy, boolean ascending) {
        requireAdmin(actor);
        if (limit < 1 || limit > MAX_PAGE_SIZE || page < 0 || page > Integer.MAX_VALUE / limit) {
            throw badRequest("Use a nonnegative page and a limit between 1 and " + MAX_PAGE_SIZE + ".");
        }
        String field = switch (sortBy == null ? "" : sortBy) {
            case "userId", "user_id" -> "userId";
            case "username", "email", "creationDate" -> sortBy;
            default -> throw badRequest("Sort by userId, username, email, or creationDate.");
        };
        Sort sort = Sort.by(ascending ? Sort.Direction.ASC : Sort.Direction.DESC, field);
        if (!field.equals("userId")) {
            sort = sort.and(Sort.by("userId"));
        }
        return users.findProfiles(PageRequest.of(page, limit, sort));
    }

    public UserDTO get(int userId, String actor) {
        requireActor(actor);
        User user = users.findById(validateId(userId)).orElseThrow(UserService::notFound);
        requireOwnerOrAdmin(user, actor);
        return toProfile(user);
    }

    /** Provisions a regular account using a password hash supplied by a trusted backend caller. */
    @Transactional
    public UserDTO create(String username, String email, String passwordHash) {
        if (passwordHash == null || passwordHash.isBlank() || passwordHash.length() > MAX_PASSWORD_HASH_LENGTH
                || passwordHash.codePoints().anyMatch(Character::isISOControl)) {
            throw badRequest("A valid password hash is required to provision an account.");
        }
        User user = new User();
        user.setUsername(validateText(username, "Username", MAX_USERNAME_LENGTH));
        user.setEmail(validateEmail(email));
        user.setPasswordHash(passwordHash);
        return toProfile(save(user));
    }

    /** Updates the supplied profile fields while holding the account row lock. */
    @Transactional
    public UserDTO update(int userId, UserUpdateDTO request, String actor) {
        requireActor(actor);
        User user = lockUser(userId);
        requireOwnerOrAdmin(user, actor);
        if (request == null || (request.username() == null && request.email() == null)) {
            throw badRequest("Supply a username or email to update.");
        }
        if (request.username() != null) {
            user.setUsername(validateText(request.username(), "Username", MAX_USERNAME_LENGTH));
        }
        if (request.email() != null) {
            user.setEmail(validateEmail(request.email()));
        }
        return toProfile(save(user));
    }

    /** Deletes an account for an administrator when no review or admin record references it. */
    @Transactional
    public void delete(int userId, String actor) {
        requireAdmin(actor);
        User user = lockUser(userId);
        try {
            users.delete(user);
            users.flush();
        } catch (DataIntegrityViolationException failure) {
            if (hasSqlState(failure, FOREIGN_KEY_VIOLATION)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This user is referenced by another record and cannot be deleted.");
            }
            throw failure;
        }
    }

    private User save(User user) {
        try {
            // Flush here so concurrent duplicate writes are reported as conflicts.
            return users.saveAndFlush(user);
        } catch (DataIntegrityViolationException failure) {
            if (hasSqlState(failure, UNIQUE_VIOLATION)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username or email is already in use.");
            }
            throw failure;
        }
    }

    private User lockUser(int userId) {
        return users.findForUpdate(validateId(userId)).orElseThrow(UserService::notFound);
    }

    private UserDTO toProfile(User user) {
        String role = accounts.findAdmin(user.getUsername()).isPresent() ? "ADMIN" : "USER";
        return new UserDTO(user.getUserId(), user.getUsername(), user.getEmail(), role, user.getCreationDate());
    }

    private void requireOwnerOrAdmin(User user, String actor) {
        if (!user.getUsername().equals(actor)) {
            requireAdmin(actor);
        }
    }

    private void requireAdmin(String actor) {
        requireActor(actor);
        if (accounts.findAdmin(actor).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required.");
        }
    }

    private static void requireActor(String actor) {
        if (actor == null || actor.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A caller identity is required.");
        }
    }

    private static int validateId(int userId) {
        if (userId < 1) {
            throw badRequest("User ID must be positive.");
        }
        return userId;
    }

    private static String validateEmail(String value) {
        String email = validateText(value, "Email", MAX_EMAIL_LENGTH);
        if (!EMAIL.matcher(email).matches()) {
            throw badRequest("Email address is invalid.");
        }
        return email;
    }

    private static String validateText(String value, String field, int maxLength) {
        String text = value == null ? "" : value.strip();
        if (text.isEmpty() || text.length() > maxLength || text.codePoints().anyMatch(Character::isISOControl)) {
            throw badRequest(field + " must contain 1 to " + maxLength + " valid characters.");
        }
        return text;
    }

    private static boolean hasSqlState(DataIntegrityViolationException failure, String state) {
        return failure.getMostSpecificCause() instanceof SQLException sql && state.equals(sql.getSQLState());
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "User was not found.");
    }
}
