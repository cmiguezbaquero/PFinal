package com.workoutplanner.backend.service;

import com.workoutplanner.backend.model.Routine;
import com.workoutplanner.backend.repository.RoutineRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

@Service
public class RoutineService {

    private final RoutineRepository repository;

    public RoutineService(RoutineRepository repository) {
        this.repository = repository;
    }

    public List<Routine> getAll() {
        return repository.findAll();
    }

    public Routine getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Routine not found"));
    }

    public Routine create(Routine routine) {
        return repository.save(routine);
    }

    public Routine update(Long id, Routine routine) {
        Routine existing = getById(id);
        existing.setName(routine.getName());
        existing.setDescription(routine.getDescription());
        return repository.save(existing);
    }

    public void delete(Long id) {
        Routine routine = getById(id);
        repository.delete(routine);
    }
}
