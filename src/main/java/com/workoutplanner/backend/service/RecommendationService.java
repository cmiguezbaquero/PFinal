package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.model.WorkoutExercise;
import com.workoutplanner.backend.repository.ExerciseRepository;
import com.workoutplanner.backend.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Locale;

@Service
public class RecommendationService {

    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;

    public RecommendationService(WorkoutRepository workoutRepository,
                                 ExerciseRepository exerciseRepository) {
        this.workoutRepository = workoutRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional(readOnly = true)
    public List<Exercise> recommendForUser(Long userId) {
        List<Workout> workouts = workoutRepository.findByUserId(userId);
        List<Exercise> allExercises = exerciseRepository.findByOwnerIdIsNullOrSharedTrueOrOwnerId(userId);

        if (allExercises.isEmpty()) {
            return List.of();
        }

        allExercises = deduplicateExercisesByName(allExercises);

        if (workouts.isEmpty()) {
            return allExercises.stream()
                    .sorted(Comparator.comparing(Exercise::getName, String.CASE_INSENSITIVE_ORDER))
                    .toList();
        }

        Map<String, Integer> muscleGroupUsage = new HashMap<>();
        for (Workout workout : workouts) {
            for (WorkoutExercise workoutExercise : workout.getExercises()) {
                Exercise exercise = workoutExercise.getExercise();
                if (exercise != null && exercise.getMuscleGroup() != null) {
                    muscleGroupUsage.merge(exercise.getMuscleGroup().toLowerCase(), 1, Integer::sum);
                }
            }
        }

        return allExercises.stream()
                .sorted(Comparator
                        .comparingInt((Exercise exercise) -> muscleGroupUsage.getOrDefault(
                                exercise.getMuscleGroup() == null ? "" : exercise.getMuscleGroup().toLowerCase(), 0))
                        .thenComparing(Exercise::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private List<Exercise> deduplicateExercisesByName(List<Exercise> exercises) {
        if (exercises == null || exercises.isEmpty()) {
            return List.of();
        }

        List<Exercise> deduplicated = new ArrayList<>();
        Set<String> seenNames = new LinkedHashSet<>();

        for (Exercise exercise : exercises) {
            if (exercise == null) {
                continue;
            }
            String key = normalizeName(exercise.getName());
            if (key.isEmpty()) {
                key = exercise.getId() == null ? "" : "id:" + exercise.getId();
            }
            if (seenNames.add(key)) {
                deduplicated.add(exercise);
            }
        }

        return deduplicated;
    }

    private String normalizeName(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}

