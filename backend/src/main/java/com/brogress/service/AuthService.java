package com.brogress.service;

import com.brogress.api.dto.AuthResponse;
import com.brogress.api.dto.LoginRequest;
import com.brogress.api.dto.RegisterRequest;
import com.brogress.domain.User;
import com.brogress.repo.UserRepository;
import com.brogress.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByNick(request.nick())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Nick already taken");
    }
    User user = new User();
    user.setNick(request.nick().trim());
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    userRepository.save(user);
    return new AuthResponse(jwtService.generateToken(user), user.getNick());
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    User user =
        userRepository
            .findByNick(request.nick().trim())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    return new AuthResponse(jwtService.generateToken(user), user.getNick());
  }
}
