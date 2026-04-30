package com.workoutplanner.backend.model;


import com.workoutplanner.backend.enums.GoalType;
import com.workoutplanner.backend.enums.Level;
import jakarta.persistence.*;

@Entity
@Table(name = "goals")
public class Goal {
    @Id
    @GeneratedValue (strategy = jakarta.persistence.GenerationType.IDENTITY)

    private Long id;
    private int daysPerWeek;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalType goalType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Level level;

    @ManyToOne
    @JoinColumn (name = "user_id")
    private User user;

    public Goal() {
    }

    public Goal(Long id, GoalType goalType, int daysPerWeek, Level level, User user) {
        this.id = id;
        this.goalType = goalType;
        this.daysPerWeek = daysPerWeek;
        this.level = level;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getDaysPerWeek() {
        return daysPerWeek;
    }

    public void setDaysPerWeek(int daysPerWeek) {
        this.daysPerWeek = daysPerWeek;
    }

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
