package com.workoutplanner.backend.repository;

import com.workoutplanner.backend.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
}

