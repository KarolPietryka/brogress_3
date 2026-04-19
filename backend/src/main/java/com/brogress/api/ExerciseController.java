package com.brogress.api;

import com.brogress.api.dto.ExerciseDto;
import com.brogress.domain.User;
import com.brogress.security.UserPrincipal;
import com.brogress.service.ExerciseService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

  private final ExerciseService exerciseService;

  public ExerciseController(ExerciseService exerciseService) {
    this.exerciseService = exerciseService;
  }

  @GetMapping("/by-id/{id}")
  public ExerciseDto getById(
      @AuthenticationPrincipal UserPrincipal principal, @PathVariable("id") long id) {
    User user = principal.getUser();
    return exerciseService.getForUser(user, id);
  }

  @GetMapping("/{bodyPart}")
  public List<ExerciseDto> listByBodyPart(
      @AuthenticationPrincipal UserPrincipal principal, @PathVariable("bodyPart") String bodyPart) {
    User user = principal.getUser();
    return exerciseService.listForUser(user, bodyPart);
  }
}
