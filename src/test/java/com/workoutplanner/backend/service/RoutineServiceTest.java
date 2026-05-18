package com.workoutplanner.backend.service;

import com.workoutplanner.backend.enums.GoalType;
import com.workoutplanner.backend.enums.Level;
import com.workoutplanner.backend.model.Exercise;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class RoutineServiceTest {

    @Test
    void selectExercisesProducesNoDuplicates() throws Exception {
        RoutineService service = new RoutineService(null, null, null);

        List<Exercise> available = new ArrayList<>();
        for (long i = 1; i <= 8; i++) {
            Exercise e = new Exercise();
            e.setId(i == 4 ? 2L : i); // duplicado de origen para validar la deduplicación
            e.setName("Ex " + i);
            e.setMuscleGroup(i % 2 == 0 ? "PIERNAS" : "PECHO");
            available.add(e);
        }

        List<String> template = List.of("LEGS");
        Set<Long> weeklyUsed = new HashSet<>();

        Method m = RoutineService.class.getDeclaredMethod("selectExercisesForWorkout", List.class, List.class, GoalType.class, Level.class, Set.class, int.class);
        m.setAccessible(true);

        @SuppressWarnings("unchecked")
        List<Exercise> selected = (List<Exercise>) m.invoke(service, available, template, GoalType.GANAR_MUSCULO, Level.INTERMEDIO, weeklyUsed, 3);

        assertNotNull(selected);
        assertEquals(3, selected.size());

        Set<Long> ids = new HashSet<>();
        for (Exercise e : selected) {
            assertNotNull(e.getId());
            ids.add(e.getId());
        }

        assertEquals(3, ids.size(), "Debe seleccionar ejercicios con ids distintos");
    }
}

