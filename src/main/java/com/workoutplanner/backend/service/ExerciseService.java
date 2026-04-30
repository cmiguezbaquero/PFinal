package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.repository.ExerciseRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    public List<Exercise> getAll() {
        return exerciseRepository.findAll();
    }

    public List<Exercise> getVisibleForUser(Long userId) {
        return exerciseRepository.findByOwnerIdIsNullOrSharedTrueOrOwnerId(userId);
    }

    public Exercise getById(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Exercise not found"));
    }

    public Exercise create(Exercise exercise) {
        validateExercise(exercise);
        if (exercise.getOwnerId() == null) {
            exercise.setShared(true);
        }
        return exerciseRepository.save(exercise);
    }

    public Exercise update(Long id, Exercise exercise) {
        validateExercise(exercise);
        Exercise existing = getById(id);
        existing.setName(exercise.getName());
        existing.setMuscleGroup(exercise.getMuscleGroup());
        existing.setDescription(exercise.getDescription());
        existing.setOwnerId(exercise.getOwnerId());
        existing.setShared(exercise.isShared());
        return exerciseRepository.save(existing);
    }

    public void delete(Long id) {
        Exercise exercise = getById(id);
        exerciseRepository.delete(exercise);
    }

    private void validateExercise(Exercise exercise) {
        if (exercise.getName() == null || exercise.getName().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Exercise name is required");
        }
        if (exercise.getMuscleGroup() == null || exercise.getMuscleGroup().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Muscle group is required");
        }
        if (exercise.getDescription() == null || exercise.getDescription().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Description is required");
        }
        if (exercise.getOwnerId() == null && !exercise.isShared()) {
            throw new ResponseStatusException(BAD_REQUEST, "Global exercises must be shared");
        }
    }
}

