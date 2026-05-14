package com.workoutplanner.backend.repository;

import com.workoutplanner.backend.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
	@Query("SELECT DISTINCT e FROM Exercise e WHERE e.ownerId IS NULL OR e.shared = true OR e.ownerId = :ownerId")
	List<Exercise> findByOwnerIdIsNullOrSharedTrueOrOwnerId(@Param("ownerId") Long ownerId);
	
	List<Exercise> findByOwnerId(Long ownerId);
}

