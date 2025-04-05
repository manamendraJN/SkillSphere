package com.sliit.backend.controller;

public class AuthResponse {
    private final String token; // Made final as per later warnings
    private final String userId; // Made final as per later warnings

    public AuthResponse(String token, String userId) {
        this.token = token;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public String getUserId() { return userId; }
}
