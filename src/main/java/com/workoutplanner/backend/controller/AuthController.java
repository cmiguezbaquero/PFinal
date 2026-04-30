package com.workoutplanner.backend.controller;

import com.workoutplanner.backend.dto.AuthLoginRequest;
import com.workoutplanner.backend.dto.AuthRegisterRequest;
import com.workoutplanner.backend.dto.AuthUserResponse;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public AuthUserResponse register(@RequestBody AuthRegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        return AuthUserResponse.from(userService.register(user));
    }

    @PostMapping("/login")
    public AuthUserResponse login(@RequestBody AuthLoginRequest request) {
        return AuthUserResponse.from(userService.login(request.getEmail(), request.getPassword()));
    }
}

