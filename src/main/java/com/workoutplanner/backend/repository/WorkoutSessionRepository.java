package com.workoutplanner.backend.repository;

import com.workoutplanner.backend.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByWorkoutId(Long workoutId);
}

