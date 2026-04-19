package com.brogress.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "brogress.jwt")
public class JwtProperties {

  /** HS256 signing secret (min 256 bits recommended). */
  private String secret = "change-me";

  private long expirationMs = 86_400_000L;

  public String getSecret() {
    return secret;
  }

  public void setSecret(String secret) {
    this.secret = secret;
  }

  public long getExpirationMs() {
    return expirationMs;
  }

  public void setExpirationMs(long expirationMs) {
    this.expirationMs = expirationMs;
  }
}
