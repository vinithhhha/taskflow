package com.taskflow.service;

import com.taskflow.dto.ProjectDto;
import com.taskflow.entity.*;
import com.taskflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public List<ProjectDto.Response> getProjects(User currentUser) {
        List<Project> projects = currentUser.getRole() == User.Role.ADMIN
            ? projectRepository.findAllByOrderByCreatedAtDesc()
            : projectRepository.findProjectsForUser(currentUser);

        return projects.stream()
            .map(p -> ProjectDto.Response.from(p, taskRepository.countByProject(p)))
            .toList();
    }

    @Transactional
    public ProjectDto.Response createProject(ProjectDto.Request req, User owner) {
        Project project = Project.builder()
            .name(req.getName())
            .description(req.getDescription())
            .owner(owner)
            .build();
        project = projectRepository.save(project);

        // Auto-add owner as ADMIN member
        ProjectMember membership = ProjectMember.builder()
            .project(project)
            .user(owner)
            .role(User.Role.ADMIN)
            .build();
        memberRepository.save(membership);
        project.getMembers().add(membership);

        return ProjectDto.Response.from(project, 0);
    }

    public ProjectDto.DetailResponse getProjectDetail(Long projectId, User currentUser) {
        Project project = getProjectOrThrow(projectId);
        checkAccess(project, currentUser);

        List<ProjectDto.DetailResponse.MemberDto> members = memberRepository
            .findByProject(project)
            .stream()
            .map(ProjectDto.DetailResponse.MemberDto::from)
            .toList();

        return ProjectDto.DetailResponse.builder()
            .id(project.getId())
            .name(project.getName())
            .description(project.getDescription())
            .owner(com.taskflow.dto.UserDto.from(project.getOwner()))
            .createdAt(project.getCreatedAt())
            .members(members)
            .build();
    }

    @Transactional
    public void updateProject(Long projectId, ProjectDto.Request req, User currentUser) {
        Project project = getProjectOrThrow(projectId);
        checkOwnerOrAdmin(project, currentUser);
        project.setName(req.getName());
        project.setDescription(req.getDescription());
        projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long projectId, User currentUser) {
        Project project = getProjectOrThrow(projectId);
        checkOwnerOrAdmin(project, currentUser);
        projectRepository.delete(project);
    }

    @Transactional
    public void addMember(Long projectId, ProjectDto.AddMemberRequest req, User currentUser) {
        Project project = getProjectOrThrow(projectId);
        checkOwnerOrAdmin(project, currentUser);

        User user = userRepository.findById(req.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (memberRepository.existsByProjectAndUser(project, user))
            throw new RuntimeException("User is already a member");

        User.Role role = "ADMIN".equalsIgnoreCase(req.getRole()) ? User.Role.ADMIN : User.Role.MEMBER;
        memberRepository.save(ProjectMember.builder()
            .project(project).user(user).role(role).build());
    }

    @Transactional
    public void removeMember(Long projectId, Long userId, User currentUser) {
        Project project = getProjectOrThrow(projectId);
        checkOwnerOrAdmin(project, currentUser);

        if (project.getOwner().getId().equals(userId))
            throw new RuntimeException("Cannot remove the project owner");

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        memberRepository.deleteByProjectAndUser(project, user);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    public Project getProjectOrThrow(Long id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public void checkAccess(Project project, User user) {
        if (user.getRole() == User.Role.ADMIN) return;
        boolean isMember = memberRepository.existsByProjectAndUser(project, user);
        if (!isMember) throw new RuntimeException("Access denied to this project");
    }

    public void checkOwnerOrAdmin(Project project, User user) {
        if (user.getRole() == User.Role.ADMIN) return;
        if (!project.getOwner().getId().equals(user.getId()))
            throw new RuntimeException("Only project owner or admin can perform this action");
    }
}
