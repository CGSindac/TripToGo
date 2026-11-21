package com.TripToGo.TTGBackend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import com.TripToGo.TTGBackend.Configuration.SecurityConfig;
import com.TripToGo.TTGBackend.Controllers.AuthController;
import com.TripToGo.TTGBackend.Controllers.LocationContoller;
import com.TripToGo.TTGBackend.Controllers.ReviewController;
import com.TripToGo.TTGBackend.Controllers.Usercontroller;
import com.TripToGo.TTGBackend.DTOs.LocationRequestDTO;
import com.TripToGo.TTGBackend.DTOs.ReviewRequestDTO;
import com.TripToGo.TTGBackend.DTOs.UserLoginDTO;
import com.TripToGo.TTGBackend.DTOs.UserRegistrationDTO;
import com.TripToGo.TTGBackend.DTOs.UserUpdateDTO;
import com.TripToGo.TTGBackend.Models.Location;
import com.TripToGo.TTGBackend.Models.Review;
import com.TripToGo.TTGBackend.Models.Tag;
import com.TripToGo.TTGBackend.Models.User;
import com.TripToGo.TTGBackend.Repositories.LocationRepository;
import com.TripToGo.TTGBackend.Repositories.ReviewRepository;
import com.TripToGo.TTGBackend.Repositories.TagRepository;
import com.TripToGo.TTGBackend.Repositories.UserRepository;
import com.TripToGo.TTGBackend.Services.AuthService;
import com.TripToGo.TTGBackend.Services.LocationService;
import com.TripToGo.TTGBackend.Services.ReviewService;
import com.TripToGo.TTGBackend.Services.UserService;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = {AuthController.class, Usercontroller.class, LocationContoller.class, ReviewController.class})
@Import({LocationService.class, ReviewService.class, UserService.class, SecurityConfig.class})
class DtoEndpointsTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @MockitoBean
    private LocationRepository locations;

    @MockitoBean
    private ReviewRepository reviews;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private TagRepository tags;

    @MockitoBean
    private UserRepository users;

    @Test
    void preservesHealthChecksAndTheOriginalLocationRoute() throws Exception {
        mvc.perform(get("/auth/health")).andExpect(status().isOk())
                .andExpect(content().string("Users Endpoint healthy"));
        mvc.perform(get("/users/health")).andExpect(status().isOk())
                .andExpect(content().string("Auth Endpoint healthy"));
        mvc.perform(get("/location/health")).andExpect(status().isOk())
                .andExpect(content().string("Location endpoint healthy"));
        mvc.perform(get("/reviews/health")).andExpect(status().isOk())
                .andExpect(content().string("Review endpoint healthy"));
        mvc.perform(get("/locations/s/abc")).andExpect(status().isOk())
                .andExpect(content().string("Location ID: abc"));
        verifyNoInteractions(locations, reviews);
    }

    @Test
    void listsLocationsWithFiltersAndPagination() throws Exception {
        PageRequest page = PageRequest.of(0, 5, Sort.by("locationId"));
        when(locations.findLocations("cathedral", "HIST", page))
                .thenReturn(new PageImpl<>(List.of(sampleLocation()), page, 12));

        mvc.perform(get("/locations").param("q", " cathedral ").param("tagCode", "HIST").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].locationId").value(42))
                .andExpect(jsonPath("$.items[0].locationName").value("Lipa Cathedral"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.totalItems").value(12))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.hasNext").value(true));
    }

    @Test
    void mapsLocationAndTagsToResponseFields() throws Exception {
        when(locations.findById(42)).thenReturn(Optional.of(sampleLocation()));

        mvc.perform(get("/locations/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.locationId").value(42))
                .andExpect(jsonPath("$.locationName").value("Lipa Cathedral"))
                .andExpect(jsonPath("$.tags[0].code").value("HIST"))
                .andExpect(jsonPath("$.tags[0].name").value("Historical"))
                .andExpect(jsonPath("$.tags[0].description").value("A heritage site"))
                .andExpect(jsonPath("$.tags[0].locations").doesNotExist());
    }

    @Test
    void listsApprovedReviewsAndKeepsAuthorDetailsPrivate() throws Exception {
        Location location = sampleLocation();
        User author = new User();
        author.setUsername("visitor");
        author.setEmail("visitor@example.com");
        author.setPasswordHash("test-hash");
        Review review = new Review();
        ReflectionTestUtils.setField(review, "reviewID", 7);
        review.setUser(author);
        review.setLocation(location);
        User verifier = new User();
        ReflectionTestUtils.setField(verifier, "userId", 8);
        review.setVerifiedBy(verifier);
        review.setEnjoymentRating(4);
        review.setBudgetRating(3);
        review.setWrittenReview("Worth a visit");
        review.setStatus("APPROVED");

        PageRequest page = PageRequest.of(0, 20, Sort.by("reviewID").descending());
        when(locations.findById(42)).thenReturn(Optional.of(location));
        when(reviews.findByLocationAndStatus(location, "APPROVED", page))
                .thenReturn(new PageImpl<>(List.of(review), page, 1));

        mvc.perform(get("/locations/42/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].reviewId").value(7))
                .andExpect(jsonPath("$.items[0].locationId").value(42))
                .andExpect(jsonPath("$.items[0].authorUsername").value("visitor"))
                .andExpect(jsonPath("$.items[0].enjoymentRating").value(4))
                .andExpect(jsonPath("$.items[0].status").value("APPROVED"))
                .andExpect(jsonPath("$.items[0].verifiedByUserId").doesNotExist())
                .andExpect(jsonPath("$.items[0].user").doesNotExist())
                .andExpect(jsonPath("$.items[0].passwordHash").doesNotExist())
                .andExpect(jsonPath("$.items[0].email").doesNotExist());
    }

    @Test
    void rejectsInvalidQueriesBeforeAccessingRepositories() throws Exception {
        mvc.perform(get("/locations").param("page", "-1").param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.page").value("Page must be zero or greater"))
                .andExpect(jsonPath("$.fieldErrors.size").value("Size must be between 1 and 100"));
        mvc.perform(get("/locations/42/reviews").param("size", "wrong"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.size").value("Expected a whole number"));
        mvc.perform(get("/locations").param("tagCode", "TOO-LONG"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/locations/0")).andExpect(status().isBadRequest());
        verifyNoInteractions(locations, reviews);
    }

    @Test
    void reportsMissingLocationsForDetailAndReviews() throws Exception {
        when(locations.findById(42)).thenReturn(Optional.empty());

        mvc.perform(get("/locations/42")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Location not found"));
        mvc.perform(get("/locations/42/reviews")).andExpect(status().isNotFound());
        verifyNoInteractions(reviews);
    }

    @Test
    void createsLocationFromSubmissionOnlyForAdministrators() throws Exception {
        String submission = """
                {
                  "locationName": "Lipa Cathedral", "country": "Philippines", "province": "Batangas",
                  "city": "Lipa", "barangay": "Poblacion", "tagCodes": ["HIST", "HIST"], "estimatedCost": 99.50
                }
                """;
        MockHttpSession visitor = signedInAs(4, "USER");
        mvc.perform(post("/locations").session(visitor).header("X-CSRF-TOKEN", csrf(visitor))
                .contentType(MediaType.APPLICATION_JSON).content(submission))
                .andExpect(status().isForbidden());
        verifyNoInteractions(locations, tags);

        MockHttpSession admin = signedInAs(5, "ADMIN");
        String token = csrf(admin);
        mvc.perform(post("/locations").session(admin).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.locationName").value("Location name is required"));
        mvc.perform(post("/locations").session(admin).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content(submission))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("One or more tag codes do not exist"));
        verifyNoInteractions(locations);

        when(tags.findAllById(List.of("HIST"))).thenReturn(List.copyOf(sampleLocation().getTags()));
        when(locations.save(any(Location.class))).thenAnswer(call -> {
            Location location = call.getArgument(0);
            ReflectionTestUtils.setField(location, "locationId", 42);
            return location;
        });
        mvc.perform(post("/locations").session(admin).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content(submission))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/locations/42"))
                .andExpect(jsonPath("$.tags[0].code").value("HIST"))
                .andExpect(jsonPath("$.estimatedCost").doesNotExist());
    }

    @Test
    void submitsPendingReviewAndRecordsAnAdministratorsDecision() throws Exception {
        Location location = sampleLocation();
        when(locations.findById(42)).thenReturn(Optional.of(location));
        when(reviews.save(any(Review.class))).thenAnswer(call -> {
            Review review = call.getArgument(0);
            assertThat(review.getUser().getUserId()).isEqualTo(4);
            assertThat(review.getLocation()).isSameAs(location);
            assertThat(review.getVerifiedBy()).isNull();
            ReflectionTestUtils.setField(review, "reviewID", 7);
            when(reviews.findByReviewID(7)).thenReturn(Optional.of(review));
            return review;
        });

        MockHttpSession visitor = signedInAs(4, "USER");
        String visitorToken = csrf(visitor);
        mvc.perform(post("/locations/42/reviews").session(visitor).header("X-CSRF-TOKEN", visitorToken)
                .contentType(MediaType.APPLICATION_JSON).content("{\"enjoymentRating\":6,\"budgetRating\":3}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.enjoymentRating").value("Enjoyment rating must be between 1 and 5"));
        mvc.perform(post("/locations/42/reviews").session(visitor).header("X-CSRF-TOKEN", visitorToken)
                .contentType(MediaType.APPLICATION_JSON).content("{\"enjoymentRating\":4.5,\"budgetRating\":3}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.enjoymentRating").value("Expected a whole number"));
        verifyNoInteractions(reviews);
        mvc.perform(post("/locations/42/reviews").session(visitor).header("X-CSRF-TOKEN", visitorToken)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"enjoymentRating":5,"budgetRating":3,"userId":99,"status":"APPROVED","verifiedBy":99}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reviewId").value(7))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.authorUsername").value("account-4"));

        String approval = "{\"decision\":\"APPROVED\"}";
        mvc.perform(patch("/reviews/7/moderation").session(visitor).header("X-CSRF-TOKEN", visitorToken)
                .contentType(MediaType.APPLICATION_JSON).content(approval))
                .andExpect(status().isForbidden());
        mvc.perform(get("/reviews/pending").session(visitor)).andExpect(status().isForbidden());

        MockHttpSession admin = signedInAs(5, "ADMIN");
        String adminToken = csrf(admin);
        Review savedReview = reviews.findByReviewID(7).orElseThrow();
        PageRequest page = PageRequest.of(0, 20, Sort.by("reviewID").descending());
        when(reviews.findByStatus("PENDING", page)).thenReturn(new PageImpl<>(List.of(savedReview)));
        mvc.perform(get("/reviews/pending").session(admin)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].reviewId").value(7));
        mvc.perform(patch("/reviews/7/moderation").session(admin).header("X-CSRF-TOKEN", adminToken)
                .contentType(MediaType.APPLICATION_JSON).content("{\"decision\":\"PENDING\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.decision").value("Decision must be APPROVED or REJECTED"));
        mvc.perform(patch("/reviews/7/moderation").session(admin).header("X-CSRF-TOKEN", adminToken)
                .contentType(MediaType.APPLICATION_JSON).content(approval))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.verifiedByUserId").value(5));
        assertThat(savedReview.getVerifiedBy().getUserId()).isEqualTo(5);
        MockHttpSession otherAdmin = signedInAs(6, "ADMIN");
        String otherToken = csrf(otherAdmin);
        mvc.perform(patch("/reviews/7/moderation").session(otherAdmin).header("X-CSRF-TOKEN", otherToken)
                .contentType(MediaType.APPLICATION_JSON).content(approval))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verifiedByUserId").value(5));
        mvc.perform(patch("/reviews/7/moderation").session(otherAdmin).header("X-CSRF-TOKEN", otherToken)
                .contentType(MediaType.APPLICATION_JSON).content("{\"decision\":\"REJECTED\"}"))
                .andExpect(status().isConflict());
        assertThat(savedReview.getVerifiedBy().getUserId()).isEqualTo(5);
    }

    @Test
    void recommendsLocationsByPreferredTagsAndFallsBackToTopRated() throws Exception {
        MockHttpSession session = new MockHttpSession();
        String token = csrf(session);
        mvc.perform(post("/recommendations").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"tagCodes\":[\"HIST\",\"X\"]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors['tagCodes[1]']").value("Tag codes must have four characters"));
        verifyNoInteractions(locations);

        Location location = sampleLocation();
        PageRequest limit = PageRequest.of(0, 20, Sort.by(Sort.Order.desc("enjoymentRating"), Sort.Order.asc("locationId")));
        when(locations.findByPreferredTags(List.of("HIST"), limit)).thenReturn(List.of(location));
        when(locations.findAll(limit)).thenReturn(new PageImpl<>(List.of(location), limit, 1));

        mvc.perform(post("/recommendations").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"tagCodes\":[\"HIST\"]}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.locations[0].locationId").value(42))
                .andExpect(jsonPath("$.locations[0].estimatedCost").doesNotExist());
        mvc.perform(post("/recommendations").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.locations[0].locationId").value(42));
        mvc.perform(post("/recommendations").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"budget\":-1}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.locations[0].locationId").value(42));
    }

    @Test
    void validatesWriteDtoFieldsAndKeepsPasswordsWriteOnly() {
        UserLoginDTO login = json.readValue("""
                {"email":"visitor@example.com","password":"example-password"}
                """, UserLoginDTO.class);
        UserRegistrationDTO registration = json.readValue("""
                {"username":"visitor","email":"visitor@example.com","password":"example-password"}
                """, UserRegistrationDTO.class);

        assertThat(login.password()).isEqualTo("example-password");
        assertThat(registration.password()).isEqualTo("example-password");
        assertThat(json.writeValueAsString(login)).doesNotContain("password");
        assertThat(json.writeValueAsString(registration)).doesNotContain("password");
        assertThat(login.toString()).doesNotContain("example-password");
        assertThat(registration.toString()).doesNotContain("example-password");

        assertThatIllegalArgumentException().isThrownBy(() -> new UserUpdateDTO(null, "invalid-email"));
        assertThatIllegalArgumentException().isThrownBy(() -> new ReviewRequestDTO(null, 3, null));
        assertThatIllegalArgumentException().isThrownBy(() -> new LocationRequestDTO(
                "Lipa Cathedral", "Philippines", "Batangas", "Lipa", "Poblacion", null, List.of("LONG-CODE")));
    }

    private Location sampleLocation() {
        Tag tag = new Tag();
        tag.setCode("HIST");
        tag.setName("Historical");
        tag.setDescription("A heritage site");
        Location location = new Location();
        ReflectionTestUtils.setField(location, "locationId", 42);
        location.setName("Lipa Cathedral");
        location.setCountry("Philippines");
        location.setProvince("Batangas");
        location.setCity("Lipa");
        location.setBarangay("Poblacion");
        location.setTags(Set.of(tag));
        return location;
    }

    private MockHttpSession signedInAs(int id, String role) {
        User user = new User();
        ReflectionTestUtils.setField(user, "userId", id);
        user.setUsername("account-" + id);
        user.setRole(role);
        when(users.findById(id)).thenReturn(Optional.of(user));
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(id, null, List.of()));
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        return session;
    }

    private String csrf(MockHttpSession session) throws Exception {
        String response = mvc.perform(get("/auth/csrf").session(session)).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(response).get("token").asString();
    }
}
