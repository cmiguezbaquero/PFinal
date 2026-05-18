package com.workoutplanner.backend.service;

import com.workoutplanner.backend.dto.WorkoutExerciseRequest;
import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.model.WorkoutExercise;
import com.workoutplanner.backend.repository.ExerciseRepository;
import com.workoutplanner.backend.repository.UserRepository;
import com.workoutplanner.backend.repository.WorkoutExerciseRepository;
import com.workoutplanner.backend.repository.WorkoutRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class WorkoutExerciseServiceTest {

    @Mock
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Mock
    private WorkoutRepository workoutRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WorkoutExerciseService service;

    @Test
    void createCreatesWorkoutWhenWorkoutMissing() {
        User user = new User();
        user.setId(7L);
        user.setName("Carolina");

        Exercise exercise = new Exercise();
        exercise.setId(9L);
        exercise.setName("Press banca");

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(exerciseRepository.save(any(Exercise.class))).thenReturn(exercise);
        when(workoutRepository.save(any(Workout.class))).thenAnswer(invocation -> {
            Workout workout = invocation.getArgument(0);
            workout.setId(15L);
            return workout;
        });
        when(workoutExerciseRepository.save(any(WorkoutExercise.class))).thenAnswer(invocation -> {
            WorkoutExercise we = invocation.getArgument(0);
            we.setId(31L);
            return we;
        });

        WorkoutExerciseRequest request = new WorkoutExerciseRequest();
        request.setUserId(7L);
        request.setPlannedDate(LocalDate.of(2026, 5, 18));
        request.setName("Press banca");
        request.setSets(3);
        request.setReps(10);
        request.setWeight(20);
        request.setNotes("Primer ejercicio del día");

        WorkoutExercise result = service.create(request);

        assertNotNull(result);
        assertNotNull(result.getWorkout());
        assertEquals(15L, result.getWorkout().getId());
        assertEquals(LocalDate.of(2026, 5, 18), result.getWorkout().getPlannedDate());
        assertEquals("Sesión personalizada", result.getWorkout().getDescription());
        assertNotNull(result.getExercise());
        assertEquals(9L, result.getExercise().getId());
        assertEquals(3, result.getSets());
        assertEquals(10, result.getReps());
        assertEquals(20, result.getWeight());

        ArgumentCaptor<Workout> workoutCaptor = ArgumentCaptor.forClass(Workout.class);
        verify(workoutRepository).save(workoutCaptor.capture());
        assertEquals(7L, workoutCaptor.getValue().getUser().getId());
        assertEquals(LocalDate.of(2026, 5, 18), workoutCaptor.getValue().getPlannedDate());

        verify(workoutExerciseRepository).save(any(WorkoutExercise.class));
    }

    @Test
    void createRejectsDuplicateExerciseInSameWorkout() {
        Workout workout = new Workout();
        workout.setId(15L);

        Exercise existingExercise = new Exercise();
        existingExercise.setId(9L);
        existingExercise.setName("Press banca");

        WorkoutExercise alreadyThere = new WorkoutExercise();
        alreadyThere.setId(31L);
        alreadyThere.setWorkout(workout);
        alreadyThere.setExercise(existingExercise);

        when(workoutRepository.findById(15L)).thenReturn(Optional.of(workout));
        when(exerciseRepository.findById(9L)).thenReturn(Optional.of(existingExercise));
        when(workoutExerciseRepository.findByWorkoutId(15L)).thenReturn(java.util.List.of(alreadyThere));

        WorkoutExerciseRequest request = new WorkoutExerciseRequest();
        request.setWorkoutId(15L);
        request.setExerciseId(9L);
        request.setName("Press banca");
        request.setSets(3);
        request.setReps(10);
        request.setWeight(20);

        assertThrows(ResponseStatusException.class, () -> service.create(request));
        verify(workoutExerciseRepository, never()).save(any());
    }
}

