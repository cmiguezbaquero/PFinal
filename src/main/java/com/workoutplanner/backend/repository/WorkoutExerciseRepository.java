package com.workoutplanner.backend.repository;

import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.model.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {
}
