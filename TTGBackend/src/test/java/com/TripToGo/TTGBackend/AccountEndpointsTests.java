package com.TripToGo.TTGBackend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import com.TripToGo.TTGBackend.Configuration.SecurityConfig;
import com.TripToGo.TTGBackend.Controllers.AuthController;
import com.TripToGo.TTGBackend.Controllers.Usercontroller;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.UserRepository;
import com.TripToGo.TTGBackend.Services.AuthService;
import com.TripToGo.TTGBackend.Services.UserService;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = {AuthController.class, Usercontroller.class})
@Import({AuthService.class, UserService.class, SecurityConfig.class})
class AccountEndpointsTests {

    private static final String TEST_PASSWORD = "example-test-password";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserRepository users;

    @Test
    void registersRegularUsersAndStoresAnEncodedPassword() throws Exception {
        when(users.saveAndFlush(any(User.class))).thenAnswer(call -> {
            User account = call.getArgument(0);
            assertThat(account.getPasswordHash()).startsWith("{pbkdf2-v1}").isNotEqualTo(TEST_PASSWORD);
            assertThat(passwordEncoder.matches(TEST_PASSWORD, account.getPasswordHash())).isTrue();
            assertThat(account.getRole()).isEqualTo("USER");
            ReflectionTestUtils.setField(account, "userId", 42);
            return account;
        });

        MockHttpSession session = new MockHttpSession();
        mvc.perform(post("/auth/register").session(session).header("X-CSRF-TOKEN", csrf(session))
                .contentType(MediaType.APPLICATION_JSON).content(registration()))
                .andExpect(status().isCreated()).andExpect(header().string("Location", "/users/42"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void loginRotatesSessionAndOwnerCanUpdateTheirProfileAndLogOut() throws Exception {
        User owner = account(42, "User");
        when(users.findById(42)).thenReturn(Optional.of(owner));
        when(users.findForUpdate(42)).thenReturn(Optional.of(owner));
        when(users.saveAndFlush(owner)).thenReturn(owner);
        MockHttpSession session = new MockHttpSession();
        String originalId = session.getId();
        String preLoginToken = csrf(session);

        signIn(owner, session, preLoginToken);
        assertThat(session.getId()).isNotEqualTo(originalId);
        mvc.perform(get("/users/42").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("visitor@example.test"));

        mvc.perform(patch("/users/42").session(session).header("X-CSRF-TOKEN", preLoginToken)
                .contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"renamed\"}"))
                .andExpect(status().isForbidden());

        String token = csrf(session);
        mvc.perform(patch("/users/42").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"renamed\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.username").value("renamed"))
                .andExpect(jsonPath("$.email").value("visitor@example.test"));

        mvc.perform(post("/auth/logout").session(session).header("X-CSRF-TOKEN", token))
                .andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
    }

    @Test
    void rejectsAnonymousRequestsAndInvalidCredentials() throws Exception {
        mvc.perform(get("/users/42")).andExpect(status().isUnauthorized());
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content(credentials(TEST_PASSWORD)))
                .andExpect(status().isForbidden());
        verifyNoInteractions(users);

        MockHttpSession session = new MockHttpSession();
        String token = csrf(session);
        mvc.perform(post("/auth/login").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content(credentials(TEST_PASSWORD)))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.detail").value("Invalid email or password"));

        when(users.findByEmail("visitor@example.test")).thenReturn(Optional.of(account(42, "USER")));
        mvc.perform(post("/auth/login").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content(credentials("wrong-test-password")))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.detail").value("Invalid email or password"));
    }

    @Test
    void checksCurrentPermissionsAndPreservesAccountsReferencedByTheDatabase() throws Exception {
        User actor = account(42, "USER");
        when(users.findById(42)).thenReturn(Optional.of(actor));
        MockHttpSession session = new MockHttpSession();
        signIn(actor, session, csrf(session));
        String token = csrf(session);

        mvc.perform(get("/users").session(session)).andExpect(status().isForbidden());
        mvc.perform(get("/users/8").session(session)).andExpect(status().isForbidden());
        mvc.perform(delete("/users/8").session(session).header("X-CSRF-TOKEN", token))
                .andExpect(status().isForbidden());

        actor.setRole("Admin");
        User target = account(8, "USER");
        PageRequest page = PageRequest.of(0, 20, Sort.by("userId"));
        when(users.findAll(page)).thenReturn(new PageImpl<>(List.of(target), page, 1));
        when(users.findById(8)).thenReturn(Optional.of(target));
        mvc.perform(get("/users").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].userId").value(8));
        mvc.perform(delete("/users/8").session(session).header("X-CSRF-TOKEN", token))
                .andExpect(status().isNoContent());
        verify(users).delete(target);

        doThrow(DataIntegrityViolationException.class).when(users).flush();
        mvc.perform(delete("/users/8").session(session).header("X-CSRF-TOKEN", token))
                .andExpect(status().isConflict());
    }

    @Test
    void rejectsInvalidRegistrationAndReportsDuplicateAccounts() throws Exception {
        MockHttpSession session = new MockHttpSession();
        String token = csrf(session);
        mvc.perform(post("/auth/register").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"invalid\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.username").value("Username is required"));
        verifyNoInteractions(users);

        when(users.saveAndFlush(any(User.class))).thenThrow(DataIntegrityViolationException.class);
        mvc.perform(post("/auth/register").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content(registration()))
                .andExpect(status().isConflict());
    }

    private String csrf(MockHttpSession session) throws Exception {
        String response = mvc.perform(get("/auth/csrf").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"))
                .andExpect(jsonPath("$.parameterName").value("_csrf"))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(response).get("token").asString();
    }

    private void signIn(User account, MockHttpSession session, String token) throws Exception {
        when(users.findByEmail(account.getEmail())).thenReturn(Optional.of(account));
        mvc.perform(post("/auth/login").session(session).header("X-CSRF-TOKEN", token)
                .with(request -> {
                    request.setRequestedSessionId(session.getId());
                    request.setRequestedSessionIdValid(true);
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON).content(credentials(TEST_PASSWORD)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.userId").value(account.getUserId()))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    private User account(int id, String role) {
        User user = new User();
        ReflectionTestUtils.setField(user, "userId", id);
        user.setEmail("visitor@example.test");
        user.setUsername("visitor");
        user.setRole(role);
        user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
        return user;
    }

    private String credentials(String password) {
        return """
                {"email":"visitor@example.test","password":"%s"}
                """.formatted(password);
    }

    private String registration() {
        return """
                {"username":"visitor","email":"visitor@example.test","password":"%s"}
                """.formatted(TEST_PASSWORD);
    }
}
