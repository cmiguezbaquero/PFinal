package com.workoutplanner.backend.controller;

import com.workoutplanner.backend.dto.WorkoutExerciseRequest;
import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.model.WorkoutExercise;
import com.workoutplanner.backend.service.WorkoutExerciseService;
import com.workoutplanner.backend.repository.WorkoutRepository;
import com.workoutplanner.backend.repository.ExerciseRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/workout-exercises")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkoutExerciseController {
    private final WorkoutExerciseService workoutExerciseService;
    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutExerciseController(WorkoutExerciseService workoutExerciseService,
                                     WorkoutRepository workoutRepository,
                                     ExerciseRepository exerciseRepository) {
        this.workoutExerciseService = workoutExerciseService;
        this.workoutRepository = workoutRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @GetMapping
    public List<WorkoutExercise> getAll() {
        return workoutExerciseService.getAll();
    }

    @GetMapping("/{id}")
    public WorkoutExercise getById(@PathVariable Long id) {
        return workoutExerciseService.getById(id);
    }

    @GetMapping("/workout/{workoutId}")
    public List<WorkoutExercise> getByWorkoutId(@PathVariable Long workoutId) {
        return workoutExerciseService.getByWorkoutId(workoutId);
    }

    @PostMapping
    public WorkoutExercise create(@RequestBody WorkoutExerciseRequest request) {
        // Resolver el Workout
        Workout workout = workoutRepository.findById(request.getWorkoutId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));

        // Resolver el Exercise
        Exercise exercise = null;
        if (request.getExerciseId() != null) {
            exercise = exerciseRepository.findById(request.getExerciseId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Exercise not found"));
        } else if (request.getName() != null && !request.getName().isBlank()) {
            // Crear un nuevo ejercicio si no existe
            exercise = new Exercise();
            exercise.setName(request.getName());
            exercise.setOwnerId(request.getUserId());
            exercise.setShared(false);
            exercise = exerciseRepository.save(exercise);
        } else {
            throw new ResponseStatusException(NOT_FOUND, "Exercise ID or name is required");
        }

        // Crear el WorkoutExercise
        WorkoutExercise we = new WorkoutExercise();
        we.setWorkout(workout);
        we.setExercise(exercise);
        we.setSets(request.getSets());
        we.setReps(request.getReps());
        we.setWeight(request.getWeight());
        we.setNotes(request.getNotes());

        return workoutExerciseService.create(we);
    }

    @PutMapping("/{id}")
    public WorkoutExercise update(
            @PathVariable Long id,
            @RequestBody WorkoutExercise workoutExercise
    ) {
        return workoutExerciseService.update(id, workoutExercise);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        workoutExerciseService.delete(id);
    }
}
