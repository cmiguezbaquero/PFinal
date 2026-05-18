package com.workoutplanner.backend.service;

import com.workoutplanner.backend.dto.WorkoutExerciseRequest;
import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.model.WorkoutExercise;
import com.workoutplanner.backend.repository.ExerciseRepository;
import com.workoutplanner.backend.repository.WorkoutExerciseRepository;
import com.workoutplanner.backend.repository.WorkoutRepository;
import com.workoutplanner.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Locale;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class WorkoutExerciseService {

    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public WorkoutExerciseService(WorkoutExerciseRepository workoutExerciseRepository,
                                  WorkoutRepository workoutRepository,
                                  ExerciseRepository exerciseRepository,
                                  UserRepository userRepository) {
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.workoutRepository = workoutRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    public List <WorkoutExercise> getAll() {
        return workoutExerciseRepository.findAll();
    }

    public List<WorkoutExercise> getByWorkoutId(Long workoutId) {
        return workoutExerciseRepository.findByWorkoutId(workoutId);
    }

    public WorkoutExercise getById(Long id) {
        return workoutExerciseRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(NOT_FOUND, "WorkoutExercise not found"));

    }

    public WorkoutExercise create(WorkoutExerciseRequest request) {
        validateRequest(request);

        Workout workout = resolveWorkout(request);
        Exercise exercise = resolveExercise(request);

        ensureWorkoutDoesNotContainDuplicateExercise(workout.getId(), exercise.getId(), exercise.getName(), null);

        WorkoutExercise we = new WorkoutExercise();
        we.setWorkout(workout);
        we.setExercise(exercise);
        we.setSets(request.getSets());
        we.setReps(request.getReps());
        we.setWeight(request.getWeight());
        we.setNotes(request.getNotes());

        return workoutExerciseRepository.save(we);
    }

    public WorkoutExercise update(Long id, WorkoutExercise updated) {
        WorkoutExercise existing = getById(id);

        existing.setSets(updated.getSets());
        existing.setReps(updated.getReps());
        existing.setWeight(updated.getWeight());

        if (updated.getExercise() != null && updated.getExercise().getId() != null) {
            Exercise exercise = exerciseRepository.findById(updated.getExercise().getId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Exercise not found"));
            Long workoutId = existing.getWorkout() == null ? null : existing.getWorkout().getId();
            ensureWorkoutDoesNotContainDuplicateExercise(workoutId, exercise.getId(), exercise.getName(), existing.getId());
            existing.setExercise(exercise);
        }

        return workoutExerciseRepository.save(existing);
    }

    public void delete(Long id) {
        workoutExerciseRepository.deleteById(id);
    }

    private Workout resolveWorkout(WorkoutExerciseRequest request) {
        if (request.getWorkoutId() != null) {
            return workoutRepository.findById(request.getWorkoutId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));
        }

        if (request.getUserId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "userId is required when workoutId is missing");
        }

        Workout workout = new Workout();
        workout.setDescription("Sesión personalizada");
        workout.setPlannedDate(request.getPlannedDate() != null ? request.getPlannedDate() : LocalDate.now());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        workout.setUser(user);
        workout.setExercises(new ArrayList<>());

        return workoutRepository.save(workout);
    }

    private Exercise resolveExercise(WorkoutExerciseRequest request) {
        if (request.getExerciseId() != null) {
            return exerciseRepository.findById(request.getExerciseId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Exercise not found"));
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Exercise ID or name is required");
        }

        Exercise exercise = new Exercise();
        exercise.setName(request.getName().trim());
        exercise.setOwnerId(request.getUserId());
        exercise.setShared(false);
        return exerciseRepository.save(exercise);
    }

    private void ensureWorkoutDoesNotContainDuplicateExercise(Long workoutId,
                                                             Long exerciseId,
                                                             String exerciseName,
                                                             Long excludeWorkoutExerciseId) {
        if (workoutId == null) {
            return;
        }

        String normalizedName = normalize(exerciseName);
        List<WorkoutExercise> existing = workoutExerciseRepository.findByWorkoutId(workoutId);
        for (WorkoutExercise current : existing) {
            if (excludeWorkoutExerciseId != null && excludeWorkoutExerciseId.equals(current.getId())) {
                continue;
            }
            Exercise currentExercise = current.getExercise();
            if (currentExercise == null) {
                continue;
            }

            boolean sameId = exerciseId != null && exerciseId.equals(currentExercise.getId());
            boolean sameName = !normalizedName.isEmpty() && normalizedName.equals(normalize(currentExercise.getName()));
            if (sameId || sameName) {
                throw new ResponseStatusException(BAD_REQUEST, "That exercise already exists in this workout");
            }
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private void validateRequest(WorkoutExerciseRequest request) {
        if (request == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Request body is required");
        }
        if (request.getWorkoutId() == null && request.getPlannedDate() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "plannedDate is required when workoutId is missing");
        }
        if (request.getWorkoutId() == null && request.getUserId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "userId is required when workoutId is missing");
        }
        if (request.getExerciseId() == null && request.getUserId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "userId is required when creating a new exercise");
        }
        if (request.getSets() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Sets must be greater than 0");
        }
        if (request.getReps() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Reps must be greater than 0");
        }
        if (request.getWeight() < 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Weight cannot be negative");
        }
    }

}
