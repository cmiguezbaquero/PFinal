package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.repository.ExerciseRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

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

    public Exercise getById(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Exercise not found"));
    }

    public Exercise create(Exercise exercise) {
        return exerciseRepository.save(exercise);
    }

    public Exercise update(Long id, Exercise exercise) {
        Exercise existing = getById(id);
        existing.setName(exercise.getName());
        existing.setMuscleGroup(exercise.getMuscleGroup());
        existing.setDescription(exercise.getDescription());
        return exerciseRepository.save(existing);
    }

    public void delete(Long id) {
        Exercise exercise = getById(id);
        exerciseRepository.delete(exercise);
    }
}

