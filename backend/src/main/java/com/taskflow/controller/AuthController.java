package com.taskflow.controller;

import com.taskflow.dto.AuthDto;
import com.taskflow.dto.UserDto;
import com.taskflow.repository.UserRepository;
import com.taskflow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody AuthDto.SignupRequest req) {
        return ResponseEntity.status(201).body(authService.signup(req));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication auth) {
        return ResponseEntity.ok(UserDto.from(
                userRepository.findByEmail(auth.getName())
                        .orElseThrow(() -> new RuntimeException("User not found"))
        ));
    }
}