package com.taskflow.controller;

import com.taskflow.dto.ProjectDto;
import com.taskflow.entity.User;
import com.taskflow.repository.UserRepository;
import com.taskflow.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto.Response>> getProjects(Authentication auth) {
        return ResponseEntity.ok(projectService.getProjects(getCurrentUser(auth)));
    }

    @PostMapping
    public ResponseEntity<ProjectDto.Response> createProject(
            @RequestBody ProjectDto.Request req, Authentication auth) {
        return ResponseEntity.status(201)
                .body(projectService.createProject(req, getCurrentUser(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto.DetailResponse> getProject(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(projectService.getProjectDetail(id, getCurrentUser(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id,
                                           @RequestBody ProjectDto.Request req,
                                           Authentication auth) {
        projectService.updateProject(id, req, getCurrentUser(auth));
        return ResponseEntity.ok(Map.of("message", "Project updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, Authentication auth) {
        projectService.deleteProject(id, getCurrentUser(auth));
        return ResponseEntity.ok(Map.of("message", "Project deleted"));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable Long id,
                                       @RequestBody ProjectDto.AddMemberRequest req,
                                       Authentication auth) {
        projectService.addMember(id, req, getCurrentUser(auth));
        return ResponseEntity.status(201).body(Map.of("message", "Member added"));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long id,
                                          @PathVariable Long userId,
                                          Authentication auth) {
        projectService.removeMember(id, userId, getCurrentUser(auth));
        return ResponseEntity.ok(Map.of("message", "Member removed"));
    }
}