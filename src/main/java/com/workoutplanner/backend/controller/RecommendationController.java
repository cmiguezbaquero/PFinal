package com.workoutplanner.backend.controller;

import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.service.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/{userId}")
    public List<Exercise> recommendForUser(@PathVariable Long userId) {
        return recommendationService.recommendForUser(userId);
    }
}

