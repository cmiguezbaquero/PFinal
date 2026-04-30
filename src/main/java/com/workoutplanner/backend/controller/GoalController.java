package com.workoutplanner.backend.controller;

import com.workoutplanner.backend.dto.UserGoalsRequest;
import com.workoutplanner.backend.model.Goal;
import com.workoutplanner.backend.service.GoalService;
import org.springframework.web.bind.annotation.*;

/**
 * ⚠️ DEPRECADO EN FASE A
 * 
 * En Fase A, usamos User.goalType, User.level, User.trainingDaysPerWeek
 * como fuente única de verdad para los objetivos.
 * 
 * Este controller se mantiene para Fase B (cuando tengamos histórico de goals)
 * y para testing.
 * 
 * ✅ Usar en su lugar: PUT /api/users/{id}/goals
 */
@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public Goal create(@RequestBody UserGoalsRequest request){
        return goalService.saveGoal(request);
    }

    @GetMapping("/user/{userId}")
    public Goal getByUser(@PathVariable Long userId){
        return goalService.getByUser(userId).orElse(null);
    }
}
