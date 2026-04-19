package com.brogress.repo;

import com.brogress.domain.Workout;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

  Optional<Workout> findByUser_IdAndWorkoutDate(Long userId, LocalDate workoutDate);

  Optional<Workout> findByIdAndUser_Id(Long id, Long userId);
}
