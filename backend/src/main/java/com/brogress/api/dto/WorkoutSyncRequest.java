package com.brogress.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record WorkoutSyncRequest(
    String workoutId,
    @NotNull LocalDate workoutDate,
    @NotNull @Valid List<WorkoutExercisePayload> exercises) {}
