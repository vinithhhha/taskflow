package com.taskflow.controller;

import com.taskflow.dto.UserDto;
import com.taskflow.entity.User;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(
                userRepository.findAll().stream().map(UserDto::from).toList()
        );
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeRole(@PathVariable Long id,
                                        @RequestBody Map<String, String> body,
                                        Authentication auth) {
        User current = getCurrentUser(auth);
        if (current.getId().equals(id))
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot change your own role"));

        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String role = body.get("role");
        target.setRole("ADMIN".equalsIgnoreCase(role) ? User.Role.ADMIN : User.Role.MEMBER);
        userRepository.save(target);
        return ResponseEntity.ok(Map.of("message", "Role updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        User current = getCurrentUser(auth);
        if (current.getId().equals(id))
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete yourself"));
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}