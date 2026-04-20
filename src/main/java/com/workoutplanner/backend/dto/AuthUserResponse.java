package com.workoutplanner.backend.dto;

import com.workoutplanner.backend.model.User;

public class AuthUserResponse {

    private Long id;
    private String name;
    private String email;

    public static AuthUserResponse from(User user) {
        AuthUserResponse response = new AuthUserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

