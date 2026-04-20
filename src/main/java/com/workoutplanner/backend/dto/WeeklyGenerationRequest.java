package com.workoutplanner.backend.dto;

import java.time.LocalDate;

public class WeeklyGenerationRequest {

    private Long userId;
    private LocalDate weekStart;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getWeekStart() {
        return weekStart;
    }

    public void setWeekStart(LocalDate weekStart) {
        this.weekStart = weekStart;
    }
}

