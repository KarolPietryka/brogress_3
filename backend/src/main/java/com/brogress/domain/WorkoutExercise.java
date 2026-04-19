package com.brogress.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "workout_exercises")
public class WorkoutExercise {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "workout_id", nullable = false)
  private Workout workout;

  @Column(nullable = false, length = 128)
  private String bodyPart;

  @Column(nullable = false, length = 256)
  private String exerciseName;

  @Column(nullable = false)
  private int weight;

  @Column(nullable = false)
  private int reps;

  @Column(nullable = false, name = "sort_order")
  private int sortOrder;

  public UUID getId() {
    return id;
  }

  public Workout getWorkout() {
    return workout;
  }

  public void setWorkout(Workout workout) {
    this.workout = workout;
  }

  public String getBodyPart() {
    return bodyPart;
  }

  public void setBodyPart(String bodyPart) {
    this.bodyPart = bodyPart;
  }

  public String getExerciseName() {
    return exerciseName;
  }

  public void setExerciseName(String exerciseName) {
    this.exerciseName = exerciseName;
  }

  public int getWeight() {
    return weight;
  }

  public void setWeight(int weight) {
    this.weight = weight;
  }

  public int getReps() {
    return reps;
  }

  public void setReps(int reps) {
    this.reps = reps;
  }

  public int getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(int sortOrder) {
    this.sortOrder = sortOrder;
  }
}
