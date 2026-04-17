package com.workoutplanner.backend.controller;

import com.workoutplanner.backend.model.WorkoutSession;
import com.workoutplanner.backend.service.WorkoutSessionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;

    public WorkoutSessionController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    @GetMapping
    public List<WorkoutSession> getAll() {
        return workoutSessionService.getAll();
    }

    @GetMapping("/{id}")
    public WorkoutSession getById(@PathVariable Long id) {
        return workoutSessionService.getById(id);
    }

    @GetMapping("/workout/{workoutId}")
    public List<WorkoutSession> getByWorkoutId(@PathVariable Long workoutId) {
        return workoutSessionService.getByWorkoutId(workoutId);
    }

    @GetMapping("/user/{userId}")
    public List<WorkoutSession> getByUserId(@PathVariable Long userId) {
        return workoutSessionService.getByUserId(userId);
    }

    @PostMapping
    public WorkoutSession create(@RequestBody WorkoutSession workoutSession) {
        return workoutSessionService.create(workoutSession);
    }

    @PutMapping("/{id}")
    public WorkoutSession update(@PathVariable Long id, @RequestBody WorkoutSession workoutSession) {
        return workoutSessionService.update(id, workoutSession);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        workoutSessionService.delete(id);
    }
}

