package com.workoutplanner.backend.repository;


import com.workoutplanner.backend.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineRepository extends JpaRepository<Routine,Long> {
}
