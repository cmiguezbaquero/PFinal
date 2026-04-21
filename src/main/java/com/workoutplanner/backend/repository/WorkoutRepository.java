package com.workoutplanner.backend.repository;

import com.workoutplanner.backend.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutRepository extends JpaRepository <Workout, Long> {
    List <Workout> findByUserId(Long userId);
    List<Workout> findByUserIdAndPlannedDateBetween(Long userId, LocalDate start, LocalDate end);
}
