package com.taskflow.service;

import com.taskflow.dto.AuthDto;
import com.taskflow.dto.UserDto;
import com.taskflow.entity.User;
import com.taskflow.repository.UserRepository;
import com.taskflow.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthDto.AuthResponse signup(AuthDto.SignupRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");

        // First user auto-becomes ADMIN
        long userCount = userRepository.count();
        User.Role role = userCount == 0 ? User.Role.ADMIN
            : ("ADMIN".equalsIgnoreCase(req.getRole()) ? User.Role.ADMIN : User.Role.MEMBER);

        User user = User.builder()
            .name(req.getName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(role)
            .build();

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthDto.AuthResponse(token, UserDto.from(user));
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid email or password");

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthDto.AuthResponse(token, UserDto.from(user));
    }
}
