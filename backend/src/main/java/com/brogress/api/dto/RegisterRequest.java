package com.brogress.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(max = 64) String nick,
    @NotBlank @Size(min = 4, max = 128) String password) {}
