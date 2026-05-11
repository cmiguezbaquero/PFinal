package com.workoutplanner.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum GoalType {
    GANAR_MUSCULO,
    PERDER_PESO,
    MANTENER_FORMA;

    @JsonCreator
    public static GoalType from(String value) {
        return GoalType.valueOf(value.toUpperCase());
    }
}
