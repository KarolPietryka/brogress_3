package com.brogress.repo;

import com.brogress.domain.BodyPart;
import com.brogress.domain.Exercise;
import com.brogress.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

  List<Exercise> findByUserAndBodyPart(User user, BodyPart bodyPart);

  Optional<Exercise> findByIdAndUser_Id(long id, long userId);
}
