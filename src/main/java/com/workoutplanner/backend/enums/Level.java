package com.workoutplanner.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Level {
    PRINCIPIANTE,
    INTERMEDIO,
    AVANZADO;

    @JsonCreator
    public static Level from(String value) {
        return Level.valueOf(value.toUpperCase());
    }
}
