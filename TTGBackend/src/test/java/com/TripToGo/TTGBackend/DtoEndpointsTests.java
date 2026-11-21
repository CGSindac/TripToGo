package com.TripToGo.TTGBackend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
import com.TripToGo.TTGBackend.Services.AuthService;
import com.TripToGo.TTGBackend.Services.LocationService;
import com.TripToGo.TTGBackend.Services.ReviewService;
import com.TripToGo.TTGBackend.Services.UserService;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = {AuthController.class, Usercontroller.class, LocationContoller.class, ReviewController.class})
@Import({LocationService.class, ReviewService.class, SecurityConfig.class})
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
    private UserService userService;

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
                .thenReturn(new PageImpl<>(List.of(sampleLocation()), page, 1));

        mvc.perform(get("/locations").param("q", " cathedral ").param("tagCode", "HIST").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].locationId").value(42))
                .andExpect(jsonPath("$.items[0].locationName").value("Lipa Cathedral"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.totalItems").value(1));
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
}
