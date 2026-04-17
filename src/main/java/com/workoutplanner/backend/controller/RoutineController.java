package com.workoutplanner.backend.controller;

import com.workoutplanner.backend.model.Routine;
import com.workoutplanner.backend.service.RoutineService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService service;

    public RoutineController (RoutineService service){
        this.service = service;
    }


    @GetMapping
    public List<Routine> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Routine getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Routine create(@RequestBody Routine routine) {
        return service.create(routine);
    }

    @PutMapping("/{id}")
    public Routine update(@PathVariable Long id, @RequestBody Routine routine) {
        return service.update(id, routine);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
