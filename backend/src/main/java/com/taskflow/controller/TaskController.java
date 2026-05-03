package com.taskflow.controller;

import com.taskflow.dto.TaskDto;
import com.taskflow.entity.User;
import com.taskflow.repository.UserRepository;
import com.taskflow.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskDto.Response>> getTasks(
            @PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, getCurrentUser(auth)));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskDto.Response> createTask(
            @PathVariable Long projectId,
            @RequestBody TaskDto.Request req,
            Authentication auth) {
        return ResponseEntity.status(201)
                .body(taskService.createTask(projectId, req, getCurrentUser(auth)));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<TaskDto.Response> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDto.Request req,
            Authentication auth) {
        return ResponseEntity.ok(taskService.updateTask(id, req, getCurrentUser(auth)));
    }

    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<TaskDto.Response> updateStatus(
            @PathVariable Long id,
            @RequestBody TaskDto.StatusRequest req,
            Authentication auth) {
        return ResponseEntity.ok(taskService.updateStatus(id, req.getStatus(), getCurrentUser(auth)));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, Authentication auth) {
        taskService.deleteTask(id, getCurrentUser(auth));
        return ResponseEntity.ok(Map.of("message", "Task deleted"));
    }
}