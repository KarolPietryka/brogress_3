package com.brogress.security;

import com.brogress.config.JwtProperties;
import com.brogress.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final JwtProperties jwtProperties;

  public JwtService(JwtProperties jwtProperties) {
    this.jwtProperties = jwtProperties;
  }

  public String generateToken(User user) {
    Date now = new Date();
    Date exp = new Date(now.getTime() + jwtProperties.getExpirationMs());
    return Jwts.builder()
        .subject(String.valueOf(user.getId()))
        .claim("nick", user.getNick())
        .issuedAt(now)
        .expiration(exp)
        .signWith(signingKey())
        .compact();
  }

  public Claims parseClaims(String token) {
    return Jwts.parser().verifyWith(signingKey()).build().parseSignedClaims(token).getPayload();
  }

  public long parseUserId(String token) {
    return Long.parseLong(parseClaims(token).getSubject());
  }

  private SecretKey signingKey() {
    return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
  }
}
