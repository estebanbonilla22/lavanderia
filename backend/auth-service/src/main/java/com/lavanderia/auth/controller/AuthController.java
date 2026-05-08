package com.lavanderia.auth.controller;

import com.lavanderia.auth.dto.AuthResponse;
import com.lavanderia.auth.dto.LoginRequest;
import com.lavanderia.auth.dto.RegisterRequest;
import com.lavanderia.auth.dto.UserResponse;
import com.lavanderia.auth.security.JwtService;
import com.lavanderia.auth.service.AuthService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.currentUser(authentication.getName()));
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        try {
            Claims claims = jwtService.parseToken(token);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "username", claims.getSubject(),
                    "role", claims.get("role"),
                    "uid", claims.get("uid")
            ));
        } catch (Exception ex) {
            return ResponseEntity.ok(Map.of("valid", false, "error", ex.getMessage()));
        }
    }
}
