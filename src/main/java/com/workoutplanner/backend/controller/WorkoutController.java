package com.workoutplanner.backend.controller;

import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.service.WorkoutService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @GetMapping
    public List<Workout> getAll() {
        return workoutService.getAll();
    }

    @GetMapping("/{id}")
    public Workout getById(@PathVariable Long id) {
        return workoutService.getById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Workout> getByUserId(@PathVariable Long userId) {
        return workoutService.getByUserId(userId);
    }

    @PostMapping
    public Workout create(@RequestBody Workout workout) {
        return workoutService.create(workout);
    }

    @PutMapping("/{id}")
    public Workout update(@PathVariable Long id, @RequestBody Workout workout) {
        return workoutService.update(id, workout);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        workoutService.delete(id);
    }
}

