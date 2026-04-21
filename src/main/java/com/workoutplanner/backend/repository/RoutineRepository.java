package com.workoutplanner.backend.repository;


import com.workoutplanner.backend.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoutineRepository extends JpaRepository<Routine,Long> {
	List<Routine> findByUserIdOrderByWeekStartDesc(Long userId);
}
