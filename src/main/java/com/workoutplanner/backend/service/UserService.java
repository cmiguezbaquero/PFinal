package com.workoutplanner.backend.service;

import com.workoutplanner.backend.dto.UserGoalsRequest;
import com.workoutplanner.backend.model.User;
import com.workoutplanner.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.util.List;
import java.util.Base64;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public UserService (UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers (){
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    public User createUser (User user){
        validateName(user.getName());
        validateEmail(user.getEmail());
        validatePassword(user.getPassword());
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(BAD_REQUEST, "Email already registered");
        }
        user.setPassword(hashPassword(user.getPassword()));
        return userRepository.save(user);
    }

    public User register(User user) {
        validateName(user.getName());
        validateEmail(user.getEmail());
        validatePassword(user.getPassword());
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(BAD_REQUEST, "Email already registered");
        }
        user.setPassword(hashPassword(user.getPassword()));
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid credentials"));

        if (!matchesPassword(password, user.getPassword())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }
        return user;
    }

    public User updateUser(Long id, User user) {
        User existingUser = getUserById(id);

        validateName(user.getName());
        validateEmail(user.getEmail());

        if (!existingUser.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(BAD_REQUEST, "Email already registered");
        }

        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());

        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            validatePassword(user.getPassword());
            existingUser.setPassword(hashPassword(user.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    public User updateGoals(Long id, UserGoalsRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND));

        validateGoalsRequest(req);

        user.setGoalType(req.getGoalType());
        user.setLevel(req.getLevel());
        user.setTrainingDaysPerWeek(req.getTrainingDaysPerWeek());
        user.setHasGoals(true);

        User savedUser = userRepository.save(user);

        return savedUser;
    }

    public User changePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (currentPassword == null || currentPassword.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Current password is required");
        }

        if (!matchesPassword(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Current password is incorrect");
        }

        validatePassword(newPassword);

        user.setPassword(hashPassword(newPassword));
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Name is required");
        }
    }

    private void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Email is required");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Password is required");
        }
        if (password.length() < 6) {
            throw new ResponseStatusException(BAD_REQUEST, "Password must be at least 6 characters");
        }
    }

    private void validateGoalsRequest(UserGoalsRequest req) {
        if (req.getGoalType() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Goal type is required");
        }
        if (req.getLevel() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Level is required");
        }
        if (req.getTrainingDaysPerWeek() < 1 || req.getTrainingDaysPerWeek() > 7) {
            throw new ResponseStatusException(BAD_REQUEST, "Training days must be between 1 and 7");
        }
    }

    private String hashPassword(String plainPassword) {
        byte[] salt = new byte[16];
        secureRandom.nextBytes(salt);

        byte[] hash = pbkdf2(plainPassword.toCharArray(), salt);
        return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
    }

    private boolean matchesPassword(String plainPassword, String storedPassword) {
        if (storedPassword == null || !storedPassword.contains(":")) {
            return false;
        }

        String[] parts = storedPassword.split(":", 2);
        byte[] salt = Base64.getDecoder().decode(parts[0]);
        byte[] expectedHash = Base64.getDecoder().decode(parts[1]);
        byte[] providedHash = pbkdf2(plainPassword.toCharArray(), salt);

        if (expectedHash.length != providedHash.length) {
            return false;
        }

        int diff = 0;
        for (int i = 0; i < expectedHash.length; i++) {
            diff |= expectedHash[i] ^ providedHash[i];
        }
        return diff == 0;
    }

    private byte[] pbkdf2(char[] password, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, 65536, 256);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return skf.generateSecret(spec).getEncoded();
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Could not process password");
        }
    }


}
