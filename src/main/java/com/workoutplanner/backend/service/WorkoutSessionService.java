package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Workout;
import com.workoutplanner.backend.model.WorkoutSession;
import com.workoutplanner.backend.repository.WorkoutRepository;
import com.workoutplanner.backend.repository.WorkoutSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class WorkoutSessionService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutRepository workoutRepository;

    public WorkoutSessionService(WorkoutSessionRepository workoutSessionRepository,
                                 WorkoutRepository workoutRepository) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.workoutRepository = workoutRepository;
    }

    public List<WorkoutSession> getAll() {
        return workoutSessionRepository.findAll();
    }

    public List<WorkoutSession> getByWorkoutId(Long workoutId) {
        return workoutSessionRepository.findByWorkoutId(workoutId);
    }

    public List<WorkoutSession> getByUserId(Long userId) {
        return workoutRepository.findByUserId(userId)
                .stream()
                .flatMap(workout -> workoutSessionRepository.findByWorkoutId(workout.getId()).stream())
                .toList();
    }

    public WorkoutSession getById(Long id) {
        return workoutSessionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout session not found"));
    }

    public WorkoutSession create(WorkoutSession session) {
        resolveWorkout(session);
        return workoutSessionRepository.save(session);
    }

    public WorkoutSession update(Long id, WorkoutSession session) {
        WorkoutSession existing = getById(id);
        existing.setDate(session.getDate());
        existing.setNotes(session.getNotes());
        if (session.getWorkout() != null && session.getWorkout().getId() != null) {
            existing.setWorkout(loadWorkout(session.getWorkout().getId()));
        }
        return workoutSessionRepository.save(existing);
    }

    public void delete(Long id) {
        WorkoutSession session = getById(id);
        workoutSessionRepository.delete(session);
    }

    private void resolveWorkout(WorkoutSession session) {
        if (session.getWorkout() != null && session.getWorkout().getId() != null) {
            session.setWorkout(loadWorkout(session.getWorkout().getId()));
        }
    }

    private Workout loadWorkout(Long id) {
        return workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));
    }
}

