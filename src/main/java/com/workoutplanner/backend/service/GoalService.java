package com.workoutplanner.backend.service;

import com.workoutplanner.backend.dto.UserGoalsRequest;
import com.workoutplanner.backend.model.Goal;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.repository.GoalRepository;
import com.workoutplanner.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    public Goal saveGoal(UserGoalsRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        //ACTUALIZAR USER
        user.setGoalType(request.getGoalType());
        user.setLevel(request.getLevel());
        user.setTrainingDaysPerWeek(request.getTrainingDaysPerWeek());
        user.setHasGoals(true);

        userRepository.save(user);

        //GUARDAR GOAL
        Goal goal = new Goal();
        goal.setGoalType(request.getGoalType());
        goal.setLevel(request.getLevel());
        goal.setDaysPerWeek(request.getTrainingDaysPerWeek());
        goal.setUser(user);

        return goalRepository.save(goal);
    }

    public Optional <Goal> getByUser(Long userId) {
        return goalRepository.findByUserId(userId);
    }
}
