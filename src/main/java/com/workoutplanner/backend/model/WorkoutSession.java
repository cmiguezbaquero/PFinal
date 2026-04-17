package com.workoutplanner.backend.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)

    private Long id;

    private LocalDate date;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "workout_id")
    private Workout workout;

    @PrePersist
    void prePersist() {
        if (date == null) {
            date = LocalDate.now();
        }
    }

    public WorkoutSession() {
    }

    public WorkoutSession(Long id, LocalDate date, String notes, Workout workout) {
        this.id = id;
        this.date = date;
        this.notes = notes;
        this.workout = workout;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Workout getWorkout() {
        return workout;
    }

    public void setWorkout(Workout workout) {
        this.workout = workout;
    }

}
