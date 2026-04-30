package com.workoutplanner.backend.dto;

public class WeeklyComplianceResponse {

    private long planned;
    private long completed;
    private double percentage;

    public WeeklyComplianceResponse(long planned, long completed, double percentage) {
        this.planned = planned;
        this.completed = completed;
        this.percentage = planned == 0 ? 0 : (completed * 100.0 / planned);;
    }

    public long getPlanned() {
        return planned;
    }

    public void setPlanned(long planned) {
        this.planned = planned;
    }

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}

