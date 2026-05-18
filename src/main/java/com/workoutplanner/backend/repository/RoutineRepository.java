package com.workoutplanner.backend.repository;

import com.workoutplanner.backend.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoutineRepository extends JpaRepository<Routine,Long> {
	List<Routine> findByUserIdOrderByWeekStartDesc(Long userId);

	// Find a routine for a given user and week start (if any)
	Optional<Routine> findByUserIdAndWeekStart(Long userId, LocalDate weekStart);
}
