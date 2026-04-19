package com.brogress.service;

import com.brogress.api.dto.ExerciseDto;
import com.brogress.domain.BodyPart;
import com.brogress.domain.Exercise;
import com.brogress.domain.User;
import com.brogress.repo.ExerciseRepository;
import com.brogress.repo.WorkoutExerciseRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExerciseService {

  private final ExerciseRepository exerciseRepository;
  private final WorkoutExerciseRepository workoutExerciseRepository;

  public ExerciseService(
      ExerciseRepository exerciseRepository, WorkoutExerciseRepository workoutExerciseRepository) {
    this.exerciseRepository = exerciseRepository;
    this.workoutExerciseRepository = workoutExerciseRepository;
  }

  @Transactional(readOnly = true)
  public List<ExerciseDto> listForUser(User user, String bodyPartRaw) {
    final BodyPart bodyPart;
    try {
      bodyPart = BodyPart.fromPath(bodyPartRaw);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
    List<Exercise> catalog = exerciseRepository.findByUserAndBodyPart(user, bodyPart);
    Map<String, Long> frequencyByName =
        frequencyMap(
            workoutExerciseRepository.countOccurrencesByExerciseNameAndBodyPart(
                user.getId(), bodyPart.toApiValue()));

    List<Exercise> sorted = new ArrayList<>(catalog);
    sorted.sort(
        Comparator.comparingLong((Exercise e) -> frequencyByName.getOrDefault(e.getName(), 0L))
            .reversed()
            .thenComparing(Exercise::getName, String.CASE_INSENSITIVE_ORDER));

    return sorted.stream().map(ExerciseService::toDto).toList();
  }

  @Transactional(readOnly = true)
  public ExerciseDto getForUser(User user, long exerciseId) {
    Optional<Exercise> found =
        exerciseRepository.findByIdAndUser_Id(exerciseId, user.getId());
    Exercise exercise =
        found.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    return toDto(exercise);
  }

  private static Map<String, Long> frequencyMap(List<Object[]> rows) {
    Map<String, Long> map = new HashMap<>();
    for (Object[] row : rows) {
      if (row.length < 2 || row[0] == null || row[1] == null) {
        continue;
      }
      String name = (String) row[0];
      long count = ((Number) row[1]).longValue();
      map.put(name, count);
    }
    return map;
  }

  private static ExerciseDto toDto(Exercise e) {
    return new ExerciseDto(e.getId(), e.getName(), e.getBodyPart().toApiValue());
  }
}
