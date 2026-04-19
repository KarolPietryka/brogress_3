package com.brogress.repo;

import com.brogress.domain.WorkoutExercise;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, UUID> {

  @Modifying
  @Query("delete from WorkoutExercise e where e.workout.id = :workoutId")
  void deleteByWorkoutId(@Param("workoutId") UUID workoutId);
}
