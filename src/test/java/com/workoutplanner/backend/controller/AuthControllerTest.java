package com.workoutplanner.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    void registerReturnsAuthUserResponseWithHasGoals() throws Exception {
        User user = new User();
        user.setId(10L);
        user.setName("Ana");
        user.setEmail("ana@test.com");
        user.setHasGoals(true);

        when(userService.register(any(User.class))).thenReturn(user);

        Map<String, Object> payload = new HashMap<>();
        payload.put("name", "Ana");
        payload.put("email", "ana@test.com");
        payload.put("password", "secret123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.email").value("ana@test.com"))
                .andExpect(jsonPath("$.hasGoals").value(true));
    }

    @Test
    void loginReturnsAuthUserResponse() throws Exception {
        User user = new User();
        user.setId(11L);
        user.setName("Bob");
        user.setEmail("bob@test.com");
        user.setHasGoals(false);

        when(userService.login("bob@test.com", "secret123")).thenReturn(user);

        Map<String, Object> payload = new HashMap<>();
        payload.put("email", "bob@test.com");
        payload.put("password", "secret123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(11))
                .andExpect(jsonPath("$.hasGoals").value(false));
    }
}


