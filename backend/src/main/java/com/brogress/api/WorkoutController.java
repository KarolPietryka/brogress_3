package com.brogress.api;

import com.brogress.api.dto.WorkoutSyncRequest;
import com.brogress.api.dto.WorkoutSyncResponse;
import com.brogress.domain.User;
import com.brogress.security.UserPrincipal;
import com.brogress.service.WorkoutSyncService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workout")
public class WorkoutController {

  private final WorkoutSyncService workoutSyncService;

  public WorkoutController(WorkoutSyncService workoutSyncService) {
    this.workoutSyncService = workoutSyncService;
  }

  @PostMapping
  public WorkoutSyncResponse sync(
      @AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody WorkoutSyncRequest body) {
    User user = principal.getUser();
    return workoutSyncService.sync(user, body);
  }
}
