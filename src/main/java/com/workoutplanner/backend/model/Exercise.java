package com.workoutplanner.backend.model;

import com.workoutplanner.backend.enums.GoalType;
import com.workoutplanner.backend.enums.Level;
import jakarta.persistence.*;

@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)

    private Long id;

    private String name;

    @Column(name = "muscle_group")
    private String muscleGroup;

    private String description;

    @Column(name = "owner_id")
    private Long ownerId;

    private boolean shared;

    @Enumerated (EnumType.STRING)
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type")
    private GoalType goalType;

    public Exercise() {
    }

    public Exercise(Long id, String name, String muscleGroup, String description, Long ownerId, boolean shared, Level level, GoalType goalType) {
        this.id = id;
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.description = description;
        this.ownerId = ownerId;
        this.shared = shared;
        this.level = level;
        this.goalType = goalType;
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

    public String getMuscleGroup() {
        return muscleGroup;
    }

    public void setMuscleGroup(String muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public boolean isShared() {
        return shared;
    }

    public void setShared(boolean shared) {
        this.shared = shared;
    }

    public Level getLevel() {
        return level;
    }

    public void setLevel(Level level) {
        this.level = level;
    }

    public GoalType getGoalType() {
        return goalType;
    }

    public void setGoalType(GoalType goalType) {
        this.goalType = goalType;
    }
}
