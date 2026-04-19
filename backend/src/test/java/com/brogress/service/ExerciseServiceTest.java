package com.brogress.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.brogress.api.dto.ExerciseDto;
import com.brogress.domain.BodyPart;
import com.brogress.domain.Exercise;
import com.brogress.domain.User;
import com.brogress.repo.ExerciseRepository;
import com.brogress.repo.WorkoutExerciseRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ExerciseServiceTest {

  @Mock private ExerciseRepository exerciseRepository;
  @Mock private WorkoutExerciseRepository workoutExerciseRepository;

  @InjectMocks private ExerciseService exerciseService;

  /**
   * When the repository returns an exercise for the given id and user, the service maps it to an
   * {@link ExerciseDto} with API-shaped body part (lowercase).
   */
  @Test
  void getForUser_returnsExerciseDto_whenOwnedByUser() {
    // Arrange: build a user with id 10 (ReflectionTestUtils — User has no setter for id) and a catalog
    // Exercise id 42 owned by that user: name "Barbell bench press", body part CHEST. This mirrors a row
    // the real repository would return for findByIdAndUser_Id(42, 10). We will assert the service maps
    // that row to a DTO with the same id and name and with body part as the API string "chest".
    User user = new User();
    ReflectionTestUtils.setField(user, "id", 10L);

    Exercise exercise = new Exercise();
    exercise.setUser(user);
    exercise.setName("Barbell bench press");
    exercise.setBodyPart(BodyPart.CHEST);
    ReflectionTestUtils.setField(exercise, "id", 42L);

    when(exerciseRepository.findByIdAndUser_Id(42L, 10L)).thenReturn(Optional.of(exercise));

    // Act: request exercise 42 for user 10 — should delegate to the repository with those exact keys.
    ExerciseDto dto = exerciseService.getForUser(user, 42L);

    // Assert: DTO must expose persistence id 42, the exercise name unchanged, and BodyPart.CHEST as lowercase "chest".
    assertThat(dto.id()).isEqualTo(42L);
    assertThat(dto.name()).isEqualTo("Barbell bench press");
    assertThat(dto.bodyPart()).isEqualTo("chest");
  }

  /**
   * When no row exists for (exerciseId, userId), the service responds with HTTP 404 via
   * {@link ResponseStatusException} (e.g. wrong id or another user's exercise).
   */
  @Test
  void getForUser_throwsNotFound_whenExerciseMissingOrOtherUser() {
    // Arrange: same user id 10 as in the happy-path test, but the repository finds no Exercise for
    // id 99 (simulates wrong id, deleted row, or row belonging to another user). We expect a 404, not a null DTO.
    User user = new User();
    ReflectionTestUtils.setField(user, "id", 10L);

    when(exerciseRepository.findByIdAndUser_Id(99L, 10L)).thenReturn(Optional.empty());

    // Act + assert: service must surface NOT_FOUND (HTTP 404) so API callers can distinguish missing catalog rows.
    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> exerciseService.getForUser(user, 99L));
    assertEquals(404, ex.getStatusCode().value());
  }
}
