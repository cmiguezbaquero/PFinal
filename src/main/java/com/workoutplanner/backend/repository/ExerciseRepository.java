package com.workoutplanner.backend.repository;

import com.workoutplanner.backend.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
	List<Exercise> findByOwnerIdIsNullOrSharedTrueOrOwnerId(Long ownerId);
	List<Exercise> findByOwnerId(Long ownerId);
}

