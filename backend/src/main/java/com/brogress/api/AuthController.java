package com.brogress.api;

import com.brogress.api.dto.AuthResponse;
import com.brogress.api.dto.LoginRequest;
import com.brogress.api.dto.RegisterRequest;
import com.brogress.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest body) {
    return authService.register(body);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest body) {
    return authService.login(body);
  }
}
