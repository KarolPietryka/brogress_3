package com.brogress.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brogress.api.dto.ExerciseDto;
import com.brogress.domain.User;
import com.brogress.security.UserPrincipal;
import com.brogress.service.ExerciseService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(controllers = ExerciseController.class)
@AutoConfigureMockMvc(addFilters = false)
class ExerciseControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private ExerciseService exerciseService;

  private User testUser;

  /** Install {@link UserPrincipal} in the security context so {@code @AuthenticationPrincipal} resolves. */
  @BeforeEach
  void setUp() {
    testUser = new User();
    ReflectionTestUtils.setField(testUser, "id", 1L);
    UserPrincipal principal = new UserPrincipal(testUser);
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()));
  }

  /** Avoid leaking authentication between tests. */
  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  /**
   * GET {@code /api/exercises/by-id/{id}} returns 200 and a JSON body matching {@link ExerciseDto}
   * when the service returns a value for the authenticated user.
   */
  @Test
  void getById_returns200AndJson() throws Exception {
    // Arrange: stub the service so a GET for exercise id 7 and the authenticated testUser (id 1) yields a fixed
    // ExerciseDto (7, "Pull-up", "back"). The controller test does not hit JPA — we only check JSON serialization
    // and status once the service returns this object.
    when(exerciseService.getForUser(eq(testUser), eq(7L)))
        .thenReturn(new ExerciseDto(7L, "Pull-up", "back"));

    // Act: HTTP GET /api/exercises/by-id/7 with SecurityContext already holding UserPrincipal(testUser).
    // Assert: 200 and JSON fields id, name, bodyPart match the DTO (client-visible contract).
    mockMvc
        .perform(get("/api/exercises/by-id/7"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(7))
        .andExpect(jsonPath("$.name").value("Pull-up"))
        .andExpect(jsonPath("$.bodyPart").value("back"));
  }

  /**
   * When the service signals not found, the controller problem propagates as HTTP 404 (no JSON body
   * asserted here).
   */
  @Test
  void getById_returns404_whenServiceThrowsNotFound() throws Exception {
    // Arrange: same path and user as the happy path, but the service layer reports NOT_FOUND (e.g. exercise not in catalog).
    // We only assert the HTTP status propagates — error body shape is out of scope here.
    when(exerciseService.getForUser(eq(testUser), eq(7L)))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

    mockMvc.perform(get("/api/exercises/by-id/7")).andExpect(status().isNotFound());
  }
}
