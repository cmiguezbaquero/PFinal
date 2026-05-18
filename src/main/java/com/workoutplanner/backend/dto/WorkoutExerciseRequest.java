package com.workoutplanner.backend.dto;

import java.time.LocalDate;

public class WorkoutExerciseRequest {
    private Long workoutId;
    private Long exerciseId;
    private String name;
    private LocalDate plannedDate;
    private int sets;
    private int reps;
    private double weight;
    private String notes;
    private Long userId;

    public WorkoutExerciseRequest() {
    }

    public WorkoutExerciseRequest(Long workoutId, Long exerciseId, String name, LocalDate plannedDate, int sets, int reps, double weight, String notes, Long userId) {
        this.workoutId = workoutId;
        this.exerciseId = exerciseId;
        this.name = name;
        this.plannedDate = plannedDate;
        this.sets = sets;
        this.reps = reps;
        this.weight = weight;
        this.notes = notes;
        this.userId = userId;
    }

    public Long getWorkoutId() {
        return workoutId;
    }

    public void setWorkoutId(Long workoutId) {
        this.workoutId = workoutId;
    }

    public Long getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(Long exerciseId) {
        this.exerciseId = exerciseId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getPlannedDate() {
        return plannedDate;
    }

    public void setPlannedDate(LocalDate plannedDate) {
        this.plannedDate = plannedDate;
    }

    public int getSets() {
        return sets;
    }

    public void setSets(int sets) {
        this.sets = sets;
    }

    public int getReps() {
        return reps;
    }

    public void setReps(int reps) {
        this.reps = reps;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}

