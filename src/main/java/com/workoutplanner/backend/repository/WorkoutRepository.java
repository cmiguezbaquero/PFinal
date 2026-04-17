package com.workoutplanner.backend.repository;

import com.workoutplanner.backend.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutRepository extends JpaRepository <Workout, Long> {
    List <Workout> findByUserId(Long userId);
}
