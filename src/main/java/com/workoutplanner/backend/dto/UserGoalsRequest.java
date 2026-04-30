package com.workoutplanner.backend.dto;

import com.workoutplanner.backend.enums.GoalType;
import com.workoutplanner.backend.enums.Level;

public class UserGoalsRequest {

    private GoalType goalType;
    private Level level;
    private int trainingDaysPerWeek;
    private Long userId;

    public GoalType getGoalType() {
        return goalType;
    }

    public void setGoalType(GoalType goalType) {
        this.goalType = goalType;
    }

    public Level getLevel() {
        return level;
    }

    public void setLevel(Level level) {
        this.level = level;
    }

    public int getTrainingDaysPerWeek() {
        return trainingDaysPerWeek;
    }

    public void setTrainingDaysPerWeek(int trainingDaysPerWeek) {
        this.trainingDaysPerWeek = trainingDaysPerWeek;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}

