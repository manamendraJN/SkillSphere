package com.sliit.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.sliit.backend.model.User;
import com.sliit.backend.repository.UserRepository;
import com.sliit.backend.security.JwtUtil;

import java.util.Base64;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            String username = auth.getName();
            User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            String token = jwtUtil.generateToken(username);
            return ResponseEntity.ok(new AuthResponse(token, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepo.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }
        if (userRepo.findById(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProfileIcon(""); // Explicitly initialize to empty string
        User savedUser = userRepo.save(user);
        String token = jwtUtil.generateToken(savedUser.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, savedUser.getId()));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepo.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new AuthResponse(null, user.getId()));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepo.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new ProfileResponse(user.getUsername(), user.getEmail(), user.getProfileIcon()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest updatedUser) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User existingUser = userRepo.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("Received profileIcon: " + (updatedUser.getProfileIcon() != null ? updatedUser.getProfileIcon().substring(0, Math.min(50, updatedUser.getProfileIcon().length())) + "..." : "null/empty"));

        // Update fields if provided
        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isEmpty()) {
            if (userRepo.findByUsername(updatedUser.getUsername()).isPresent() &&
                !updatedUser.getUsername().equals(existingUser.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
            }
            existingUser.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
            if (userRepo.findById(updatedUser.getEmail()).isPresent() &&
                !updatedUser.getEmail().equals(existingUser.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
            }
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        if (updatedUser.getProfileIcon() != null && !updatedUser.getProfileIcon().isEmpty()) {
            // Validate Base64 string
            if (!isValidBase64Image(updatedUser.getProfileIcon())) {
                System.out.println("Invalid profileIcon format: " + updatedUser.getProfileIcon().substring(0, Math.min(50, updatedUser.getProfileIcon().length())) + "...");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid profile icon format. Must be a valid Base64 image.");
            }
            existingUser.setProfileIcon(updatedUser.getProfileIcon());
        } else if (updatedUser.getProfileIcon() != null && updatedUser.getProfileIcon().isEmpty()) {
            existingUser.setProfileIcon(""); // Allow clearing the profile icon
        }

        User savedUser = userRepo.save(existingUser);
        System.out.println("Saved user with profileIcon: " + savedUser.getProfileIcon().substring(0, Math.min(50, savedUser.getProfileIcon().length())) + "...");
        String newToken = jwtUtil.generateToken(savedUser.getUsername());
        return ResponseEntity.ok(new AuthResponse(newToken, savedUser.getId()));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepo.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        userRepo.delete(user);
        return ResponseEntity.ok("Account deleted successfully");
    }

    // Helper method to validate Base64 image
    private boolean isValidBase64Image(String base64) {
        if (base64 == null || base64.isEmpty()) {
            return true; // Allow empty string to clear profile icon
        }
        String base64Pattern = "^data:image/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/=]+$";
        if (!Pattern.matches(base64Pattern, base64)) {
            return false;
        }
        try {
            Base64.getDecoder().decode(base64.split(",")[1]);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}

class AuthRequest {
    private String username;
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class AuthResponse {
    private final String token;
    private final String userId;

    public AuthResponse(String token, String userId) {
        this.token = token;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public String getUserId() { return userId; }
}

class RegisterRequest {
    private String username;
    private String email;
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class ProfileResponse {
    private String username;
    private String email;
    private String profileIcon;

    public ProfileResponse(String username, String email, String profileIcon) {
        this.username = username;
        this.email = email;
        this.profileIcon = profileIcon != null ? profileIcon : "";
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProfileIcon() { return profileIcon; }
    public void setProfileIcon(String profileIcon) { this.profileIcon = profileIcon; }
}

class UpdateProfileRequest {
    private String username;
    private String email;
    private String password;
    private String profileIcon;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getProfileIcon() { return profileIcon; }
    public void setProfileIcon(String profileIcon) { this.profileIcon = profileIcon; }
}