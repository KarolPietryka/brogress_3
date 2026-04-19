package com.brogress.domain;

public enum BodyPart {
  SHOULDERS,
  ARMS,
  CHEST,
  ABS,
  BACK,
  LEGS;

  public static BodyPart fromPath(String raw) {
    if (raw == null || raw.isBlank()) {
      throw new IllegalArgumentException("bodyPart required");
    }
    String s = raw.trim();
    for (BodyPart b : values()) {
      if (b.name().equalsIgnoreCase(s)) {
        return b;
      }
    }
    throw new IllegalArgumentException("Unknown body part: " + s);
  }

  public String toApiValue() {
    return name().toLowerCase();
  }
}
