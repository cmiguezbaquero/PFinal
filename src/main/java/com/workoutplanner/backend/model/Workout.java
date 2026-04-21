package com.workoutplanner.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workouts")
public class Workout {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)

    private Long id;

    private String description;

    private LocalDate createdAt;

    private LocalDate plannedDate;

    private boolean completed;

    private LocalDate completedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "routine_id")
    @JsonBackReference
    private Routine routine;

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutExercise> exercises = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDate.now();
        }
        if (plannedDate == null) {
            plannedDate = createdAt;
        }
    }

    public Workout() {
    }

    public Workout(String description, User user, Routine routine, LocalDate plannedDate, boolean completed, LocalDate completedAt, List<WorkoutExercise> exercises) {
        this.description = description;
        this.user = user;
        this.routine = routine;
        this.plannedDate = plannedDate;
        this.completed = completed;
        this.completedAt = completedAt;
        this.exercises = exercises;
    }

    public Workout(Long id, String description, LocalDate createdAt, LocalDate plannedDate, boolean completed, LocalDate completedAt, User user, Routine routine, List<WorkoutExercise> exercises) {
        this.id = id;
        this.description = description;
        this.createdAt = createdAt;
        this.plannedDate = plannedDate;
        this.completed = completed;
        this.completedAt = completedAt;
        this.user = user;
        this.routine = routine;
        this.exercises = exercises;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<WorkoutExercise> getExercises() {
        return exercises;
    }

    public void setExercises(List<WorkoutExercise> exercises) {
        this.exercises = exercises;
    }

    public LocalDate getPlannedDate() {
        return plannedDate;
    }

    public void setPlannedDate(LocalDate plannedDate) {
        this.plannedDate = plannedDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDate getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDate completedAt) {
        this.completedAt = completedAt;
    }

    public Routine getRoutine() {
        return routine;
    }

    public void setRoutine(Routine routine) {
        this.routine = routine;
    }
}
