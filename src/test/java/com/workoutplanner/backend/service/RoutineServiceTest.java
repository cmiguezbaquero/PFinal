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
        String[] names = {"Bench press", "Squat", "Deadlift", "Bench press", "Crunch", "Squat", "Shoulder press", "Row"};
        for (long i = 1; i <= names.length; i++) {
            Exercise e = new Exercise();
            e.setId(i);
            e.setName(names[(int) i - 1]);
            e.setMuscleGroup(i % 2 == 0 ? "PIERNAS" : "PECHO");
            available.add(e);
        }

        List<String> template = List.of("FULL");
        Set<Long> weeklyUsed = new HashSet<>();

        Method m = RoutineService.class.getDeclaredMethod("selectExercisesForWorkout", List.class, List.class, GoalType.class, Level.class, Set.class, int.class);
        m.setAccessible(true);

        @SuppressWarnings("unchecked")
        List<Exercise> selected = (List<Exercise>) m.invoke(service, available, template, GoalType.GANAR_MUSCULO, Level.INTERMEDIO, weeklyUsed, 4);

        assertNotNull(selected);
        assertEquals(4, selected.size());

        Set<String> namesSeen = new HashSet<>();
        for (Exercise e : selected) {
            assertNotNull(e.getId());
            assertTrue(namesSeen.add(e.getName().toLowerCase()), "No debe repetir el mismo ejercicio por nombre");
        }

        assertEquals(4, namesSeen.size(), "Debe seleccionar ejercicios con nombres distintos");
    }
}

