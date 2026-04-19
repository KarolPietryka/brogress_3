package com.brogress.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "exercises",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_exercise_user_name_bodypart",
            columnNames = {"user_id", "name", "body_part"}))
public class Exercise {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false, length = 256)
  private String name;

  @Convert(converter = BodyPartAttributeConverter.class)
  @Column(name = "body_part", nullable = false, length = 32)
  private BodyPart bodyPart;

  public Long getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public BodyPart getBodyPart() {
    return bodyPart;
  }

  public void setBodyPart(BodyPart bodyPart) {
    this.bodyPart = bodyPart;
  }
}
