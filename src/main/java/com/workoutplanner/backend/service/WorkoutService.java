package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.model.WorkoutExercise;
import com.workoutplanner.backend.repository.ExerciseRepository;
import com.workoutplanner.backend.repository.UserRepository;
import com.workoutplanner.backend.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
public class WorkoutService {

	private final WorkoutRepository workoutRepository;
	private final UserRepository userRepository;
	private final ExerciseRepository exerciseRepository;

	public WorkoutService(WorkoutRepository workoutRepository,
						  UserRepository userRepository,
						  ExerciseRepository exerciseRepository) {
		this.workoutRepository = workoutRepository;
		this.userRepository = userRepository;
		this.exerciseRepository = exerciseRepository;
	}

	public List<Workout> getAll() {
		return workoutRepository.findAll();
	}

	public List<Workout> getByUserId(Long userId) {
		return workoutRepository.findByUserId(userId);
	}

	public Workout getById(Long id) {
		return workoutRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));
	}

	public Workout create(Workout workout) {
		resolveRelations(workout);
		return workoutRepository.save(workout);
	}

	public Workout update(Long id, Workout workout) {
		Workout existing = getById(id);
		existing.setDescription(workout.getDescription());
		if (workout.getCreatedAt() != null) {
			existing.setCreatedAt(workout.getCreatedAt());
		}

		if (workout.getUser() != null && workout.getUser().getId() != null) {
			existing.setUser(loadUser(workout.getUser().getId()));
		}

		if (workout.getExercises() != null) {
			List<WorkoutExercise> resolvedExercises = resolveExercises(workout, workout.getExercises());
			existing.getExercises().clear();
			existing.getExercises().addAll(resolvedExercises);
		}

		return workoutRepository.save(existing);
	}

	public void delete(Long id) {
		Workout workout = getById(id);
		workoutRepository.delete(workout);
	}

	private void resolveRelations(Workout workout) {
		if (workout.getUser() != null && workout.getUser().getId() != null) {
			workout.setUser(loadUser(workout.getUser().getId()));
		}

		if (workout.getExercises() != null) {
			workout.setExercises(resolveExercises(workout, workout.getExercises()));
		}
	}

	private List<WorkoutExercise> resolveExercises(Workout workout, List<WorkoutExercise> exercises) {
		List<WorkoutExercise> resolvedExercises = new ArrayList<>();
		for (WorkoutExercise workoutExercise : exercises) {
			if (workoutExercise.getExercise() != null && workoutExercise.getExercise().getId() != null) {
				workoutExercise.setExercise(loadExercise(workoutExercise.getExercise().getId()));
			}
			workoutExercise.setWorkout(workout);
			resolvedExercises.add(workoutExercise);
		}
		return resolvedExercises;
	}

	private User loadUser(Long id) {
		return userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
	}

	private Exercise loadExercise(Long id) {
		return exerciseRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Exercise not found"));
	}
}
