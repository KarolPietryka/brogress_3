package com.brogress.service;

import com.brogress.api.dto.WorkoutExercisePayload;
import com.brogress.api.dto.WorkoutSyncRequest;
import com.brogress.api.dto.WorkoutSyncResponse;
import com.brogress.domain.User;
import com.brogress.domain.Workout;
import com.brogress.domain.WorkoutExercise;
import com.brogress.repo.WorkoutExerciseRepository;
import com.brogress.repo.WorkoutRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WorkoutSyncService {

  private final WorkoutRepository workoutRepository;
  private final WorkoutExerciseRepository workoutExerciseRepository;

  public WorkoutSyncService(
      WorkoutRepository workoutRepository, WorkoutExerciseRepository workoutExerciseRepository) {
    this.workoutRepository = workoutRepository;
    this.workoutExerciseRepository = workoutExerciseRepository;
  }

  @Transactional
  public WorkoutSyncResponse sync(User user, WorkoutSyncRequest request) {
    Workout workout = resolveWorkout(user, request);
    workoutExerciseRepository.deleteByWorkoutId(workout.getId());
    workoutExerciseRepository.flush();
    for (WorkoutExercisePayload line : request.exercises()) {
      WorkoutExercise ex = new WorkoutExercise();
      ex.setWorkout(workout);
      ex.setBodyPart(line.bodyPart());
      ex.setExerciseName(line.exerciseName());
      ex.setWeight(line.weight());
      ex.setReps(line.reps());
      ex.setSortOrder(line.orderId());
      workoutExerciseRepository.save(ex);
    }
    return new WorkoutSyncResponse(
        workout.getId().toString(), workout.getWorkoutDate().toString());
  }

  private Workout resolveWorkout(User user, WorkoutSyncRequest request) {
    Long requestedId = parseLongIdOrNull(request.workoutId());
    if (requestedId != null) {
      Workout byId =
          workoutRepository
              .findByIdAndUser_Id(requestedId, user.getId())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout"));
      return byId;
    }
    return workoutRepository
        .findByUser_IdAndWorkoutDate(user.getId(), request.workoutDate())
        .orElseGet(
            () -> {
              Workout w = new Workout();
              w.setUser(user);
              w.setWorkoutDate(request.workoutDate());
              return workoutRepository.save(w);
            });
  }

  private static Long parseLongIdOrNull(String raw) {
    if (!StringUtils.hasText(raw)) {
      return null;
    }
    try {
      return Long.parseLong(raw.trim());
    } catch (NumberFormatException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid workoutId");
    }
  }
}
