package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.model.Routine;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.model.WorkoutExercise;
import com.workoutplanner.backend.repository.ExerciseRepository;
import com.workoutplanner.backend.repository.RoutineRepository;
import com.workoutplanner.backend.repository.UserRepository;
import com.workoutplanner.backend.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
public class WorkoutService {

	private final WorkoutRepository workoutRepository;
	private final UserRepository userRepository;
	private final ExerciseRepository exerciseRepository;
	private final RoutineRepository routineRepository;

	public WorkoutService(WorkoutRepository workoutRepository,
						  UserRepository userRepository,
						  ExerciseRepository exerciseRepository,
						  RoutineRepository routineRepository) {
		this.workoutRepository = workoutRepository;
		this.userRepository = userRepository;
		this.exerciseRepository = exerciseRepository;
		this.routineRepository = routineRepository;
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

	public List<Workout> getByUserAndWeek(Long userId, LocalDate weekStart) {
		LocalDate end = weekStart.plusDays(6);
		return workoutRepository.findByUserIdAndPlannedDateBetween(userId, weekStart, end);
	}

	public Workout create(Workout workout) {
		validateWorkout(workout);
		resolveRelations(workout);
		return workoutRepository.save(workout);
	}

	public Workout update(Long id, Workout workout) {
		validateWorkout(workout);
		Workout existing = getById(id);
		existing.setDescription(workout.getDescription());
		if (workout.getCreatedAt() != null) {
			existing.setCreatedAt(workout.getCreatedAt());
		}

		if (workout.getUser() != null && workout.getUser().getId() != null) {
			existing.setUser(loadUser(workout.getUser().getId()));
		}

		if (workout.getRoutine() != null && workout.getRoutine().getId() != null) {
			existing.setRoutine(loadRoutine(workout.getRoutine().getId()));
		}

		if (workout.getPlannedDate() != null) {
			existing.setPlannedDate(workout.getPlannedDate());
		}

		existing.setCompleted(workout.isCompleted());
		existing.setCompletedAt(workout.getCompletedAt());

		if (workout.getExercises() != null) {
			List<WorkoutExercise> resolvedExercises = resolveExercises(existing, workout.getExercises());
			existing.getExercises().clear();
			existing.getExercises().addAll(resolvedExercises);
		}

		return workoutRepository.save(existing);
	}

	public void delete(Long id) {
		Workout workout = getById(id);
		workoutRepository.delete(workout);
	}

	public Workout markCompleted(Long id, boolean completed) {
		Workout workout = getById(id);
		workout.setCompleted(completed);
		workout.setCompletedAt(completed ? LocalDate.now() : null);
		return workoutRepository.save(workout);
	}

	private void resolveRelations(Workout workout) {
		if (workout.getUser() != null && workout.getUser().getId() != null) {
			workout.setUser(loadUser(workout.getUser().getId()));
		}

		if (workout.getRoutine() != null && workout.getRoutine().getId() != null) {
			workout.setRoutine(loadRoutine(workout.getRoutine().getId()));
		}

		if (workout.getExercises() != null) {
			workout.setExercises(resolveExercises(workout, workout.getExercises()));
		}
	}

	private List<WorkoutExercise> resolveExercises(Workout workout, List<WorkoutExercise> exercises) {
		List<WorkoutExercise> resolvedExercises = new ArrayList<>();
		for (WorkoutExercise workoutExercise : exercises) {
			validateWorkoutExercise(workoutExercise);
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

	private Routine loadRoutine(Long id) {
		return routineRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Routine not found"));
	}

	private void validateWorkout(Workout workout) {
		if (workout.getUser() == null || workout.getUser().getId() == null) {
			throw new ResponseStatusException(BAD_REQUEST, "Workout user is required");
		}
		if (workout.getDescription() == null || workout.getDescription().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Workout description is required");
		}
		if (workout.getExercises() == null || workout.getExercises().isEmpty()) {
			throw new ResponseStatusException(BAD_REQUEST, "Workout must include at least one exercise");
		}
	}

	private void validateWorkoutExercise(WorkoutExercise workoutExercise) {
		if (workoutExercise.getExercise() == null || workoutExercise.getExercise().getId() == null) {
			throw new ResponseStatusException(BAD_REQUEST, "Exercise id is required");
		}
		if (workoutExercise.getSets() <= 0) {
			throw new ResponseStatusException(BAD_REQUEST, "Sets must be greater than 0");
		}
		if (workoutExercise.getReps() <= 0) {
			throw new ResponseStatusException(BAD_REQUEST, "Reps must be greater than 0");
		}
		if (workoutExercise.getWeight() < 0) {
			throw new ResponseStatusException(BAD_REQUEST, "Weight cannot be negative");
		}
	}
}
