package com.brogress.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WorkoutExercisePayload(
    int orderId,
    @NotBlank @Size(max = 128) String bodyPart,
    @NotBlank @Size(max = 256) String exerciseName,
    @Min(0) int weight,
    @Min(0) int reps) {}
