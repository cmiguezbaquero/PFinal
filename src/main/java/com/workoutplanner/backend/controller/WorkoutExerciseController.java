package com.workoutplanner.backend.controller;

import com.workoutplanner.backend.model.WorkoutExercise;
import com.workoutplanner.backend.service.WorkoutExerciseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-exercises")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkoutExerciseController {
    private final WorkoutExerciseService workoutExerciseService;

    public WorkoutExerciseController(WorkoutExerciseService workoutExerciseService) {
        this.workoutExerciseService = workoutExerciseService;
    }

    @GetMapping
    public List<WorkoutExercise> getAll() {
        return workoutExerciseService.getAll();
    }

    @GetMapping("/{id}")
    public WorkoutExercise getById(@PathVariable Long id) {
        return workoutExerciseService.getById(id);
    }

    @PostMapping
    public WorkoutExercise create(@RequestBody WorkoutExercise workoutExercise) {
        return workoutExerciseService.create(workoutExercise);
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
