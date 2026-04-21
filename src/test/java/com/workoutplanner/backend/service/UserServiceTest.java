package com.workoutplanner.backend.service;

import com.workoutplanner.backend.dto.UserGoalsRequest;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void registerHashesPassword() {
        User input = new User();
        input.setName("Ana");
        input.setEmail("ana@test.com");
        input.setPassword("secret123");

        when(userRepository.existsByEmail("ana@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User saved = userService.register(input);

        assertNotEquals("secret123", saved.getPassword());
        assertTrue(passwordEncoder.matches("secret123", saved.getPassword()));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void loginWithWrongPasswordThrowsUnauthorized() {
        User stored = new User();
        stored.setEmail("ana@test.com");
        stored.setPassword(passwordEncoder.encode("secret123"));

        when(userRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(stored));

        assertThrows(ResponseStatusException.class, () -> userService.login("ana@test.com", "bad"));
    }

    @Test
    void updateGoalsMarksUserAsHavingGoals() {
        User user = new User();
        user.setId(1L);

        UserGoalsRequest request = new UserGoalsRequest();
        request.setGoalType("gain_muscle");
        request.setLevel("beginner");
        request.setTrainingDaysPerWeek(3);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User updated = userService.updateGoals(1L, request);

        assertTrue(updated.isHasGoals());
        assertEquals(3, updated.getTrainingDaysPerWeek());
    }
}

