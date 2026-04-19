package com.brogress.api.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank String nick, @NotBlank String password) {}
