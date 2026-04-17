package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.model.WorkoutExercise;
import com.workoutplanner.backend.repository.ExerciseRepository;
import com.workoutplanner.backend.repository.WorkoutExerciseRepository;
import com.workoutplanner.backend.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class WorkoutExerciseService {

    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutExerciseService(WorkoutExerciseRepository workoutExerciseRepository,
                                  WorkoutRepository workoutRepository,
                                  ExerciseRepository exerciseRepository) {
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.workoutRepository = workoutRepository;
        this.exerciseRepository = exerciseRepository;
    }

    public List <WorkoutExercise> getAll() {
        return workoutExerciseRepository.findAll();
    }

    public WorkoutExercise getById(Long id) {
        return workoutExerciseRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(NOT_FOUND, "WorkoutExercise not found"));

    }

    public WorkoutExercise create(WorkoutExercise we) {

        // validar workout
        if (we.getWorkout() != null && we.getWorkout().getId() != null) {
            Workout workout = workoutRepository.findById(we.getWorkout().getId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));
            we.setWorkout(workout);
        }

        // validar exercise
        if (we.getExercise() != null && we.getExercise().getId() != null) {
            Exercise exercise = exerciseRepository.findById(we.getExercise().getId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Exercise not found"));
            we.setExercise(exercise);
        }

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
            existing.setExercise(exercise);
        }

        return workoutExerciseRepository.save(existing);
    }

    public void delete(Long id) {
        workoutExerciseRepository.deleteById(id);
    }

}
