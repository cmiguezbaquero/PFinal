package com.workoutplanner.backend.dto;
import com.workoutplanner.backend.model.User;

public class AuthUserResponse {

    private Long id;
    private String name;
    private String email;
    private boolean hasGoals;
    private String goalType;
    private int trainingDaysPerWeek;
    private String level;

    public static AuthUserResponse from(User user) {
        AuthUserResponse response = new AuthUserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setHasGoals(user.isHasGoals());
        response.setTrainingDaysPerWeek(user.getTrainingDaysPerWeek());
        response.setGoalType(user.getGoalType() != null ? user.getGoalType().name() : null);
        response.setLevel(user.getLevel() != null ? user.getLevel().name() : null);
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isHasGoals() {
        return hasGoals;
    }

    public void setHasGoals(boolean hasGoals) {
        this.hasGoals = hasGoals;
    }

    public String getGoalType() {
        return goalType;
    }

    public void setGoalType(String goalType) {
        this.goalType = goalType;
    }

    public int getTrainingDaysPerWeek() {
        return trainingDaysPerWeek;
    }

    public void setTrainingDaysPerWeek(int trainingDaysPerWeek) {
        this.trainingDaysPerWeek = trainingDaysPerWeek;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }
}

