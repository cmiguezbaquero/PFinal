package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.model.Routine;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.repository.ExerciseRepository;
import com.workoutplanner.backend.repository.RoutineRepository;
import com.workoutplanner.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoutineServiceTest {

    @Mock
    private RoutineRepository routineRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    private RoutineService routineService;

    @BeforeEach
    void setUp() {
        routineService = new RoutineService(routineRepository, userRepository, exerciseRepository);
    }

    @Test
    void generateWeeklyPlanRespectsFiveDays() {
        User user = new User();
        user.setId(1L);
        user.setTrainingDaysPerWeek(5);
        user.setGoalType("gain_muscle");
        user.setLevel("beginner");

        Exercise e1 = new Exercise();
        e1.setId(1L);
        e1.setName("Squat");
        Exercise e2 = new Exercise();
        e2.setId(2L);
        e2.setName("Bench");

        LocalDate weekStart = LocalDate.of(2026, 4, 20);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(exerciseRepository.findByOwnerIdIsNullOrSharedTrueOrOwnerId(1L)).thenReturn(List.of(e1, e2));
        when(routineRepository.save(any(Routine.class))).thenAnswer(inv -> inv.getArgument(0));

        Routine routine = routineService.generateWeeklyPlan(1L, weekStart);

        assertEquals(5, routine.getWorkouts().size());
        assertEquals(weekStart.plusDays(0), routine.getWorkouts().get(0).getPlannedDate());
        assertEquals(weekStart.plusDays(2), routine.getWorkouts().get(1).getPlannedDate());
        assertEquals(weekStart.plusDays(3), routine.getWorkouts().get(2).getPlannedDate());
        assertEquals(weekStart.plusDays(5), routine.getWorkouts().get(3).getPlannedDate());
        assertEquals(weekStart.plusDays(6), routine.getWorkouts().get(4).getPlannedDate());
    }

    @Test
    void generateWeeklyPlanWithInvalidDaysThrowsBadRequest() {
        User user = new User();
        user.setId(1L);
        user.setTrainingDaysPerWeek(0);
        user.setGoalType("maintain");
        user.setLevel("beginner");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(ResponseStatusException.class,
                () -> routineService.generateWeeklyPlan(1L, LocalDate.of(2026, 4, 20)));
    }
}

