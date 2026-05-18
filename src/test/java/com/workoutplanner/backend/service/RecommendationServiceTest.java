package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Exercise;
import com.workoutplanner.backend.repository.ExerciseRepository;
import com.workoutplanner.backend.repository.WorkoutRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private WorkoutRepository workoutRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @InjectMocks
    private RecommendationService service;

    @Test
    void recommendForUserRemovesDuplicateNames() {
        Exercise first = new Exercise();
        first.setId(1L);
        first.setName("Press banca");
        first.setMuscleGroup("Pecho");

        Exercise duplicate = new Exercise();
        duplicate.setId(2L);
        duplicate.setName("press banca");
        duplicate.setMuscleGroup("PECHO");

        Exercise second = new Exercise();
        second.setId(3L);
        second.setName("Sentadilla");
        second.setMuscleGroup("Piernas");

        when(workoutRepository.findByUserId(7L)).thenReturn(List.of());
        when(exerciseRepository.findByOwnerIdIsNullOrSharedTrueOrOwnerId(7L)).thenReturn(List.of(first, duplicate, second));

        List<Exercise> recommendations = service.recommendForUser(7L);

        assertEquals(2, recommendations.size());
        assertEquals("Press banca", recommendations.get(0).getName());
        assertEquals("Sentadilla", recommendations.get(1).getName());
    }
}

