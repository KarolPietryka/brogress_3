package com.brogress.repo;

import com.brogress.domain.WorkoutExercise;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {

  @Modifying
  @Query("delete from WorkoutExercise e where e.workout.id = :workoutId")
  void deleteByWorkoutId(@Param("workoutId") Long workoutId);

  /**
   * Counts workout_exercises rows per exercise name for the user, filtered by body part (case-insensitive
   * match to catalog API values e.g. {@code chest}).
   */
  @Query(
      "select we.exerciseName, count(we) from WorkoutExercise we join we.workout w where w.user.id = "
          + ":userId and lower(we.bodyPart) = lower(:bodyPart) group by we.exerciseName")
  List<Object[]> countOccurrencesByExerciseNameAndBodyPart(
      @Param("userId") Long userId, @Param("bodyPart") String bodyPart);
}
