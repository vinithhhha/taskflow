package com.taskflow.service;

import com.taskflow.dto.TaskDto;
import com.taskflow.entity.*;
import com.taskflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;

    public List<TaskDto.Response> getTasksByProject(Long projectId, User currentUser) {
        Project project = projectService.getProjectOrThrow(projectId);
        projectService.checkAccess(project, currentUser);
        return taskRepository.findByProjectOrderByCreatedAtDesc(project)
            .stream().map(TaskDto.Response::from).toList();
    }

    @Transactional
    public TaskDto.Response createTask(Long projectId, TaskDto.Request req, User currentUser) {
        Project project = projectService.getProjectOrThrow(projectId);
        projectService.checkAccess(project, currentUser);

        User assignee = null;
        if (req.getAssigneeId() != null)
            assignee = userRepository.findById(req.getAssigneeId()).orElse(null);

        Task.Status status = parseStatus(req.getStatus(), Task.Status.TODO);
        Task.Priority priority = parsePriority(req.getPriority(), Task.Priority.MEDIUM);

        Task task = Task.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .project(project)
            .assignee(assignee)
            .createdBy(currentUser)
            .status(status)
            .priority(priority)
            .dueDate(req.getDueDate())
            .build();

        return TaskDto.Response.from(taskRepository.save(task));
    }

    @Transactional
    public TaskDto.Response updateTask(Long taskId, TaskDto.Request req, User currentUser) {
        Task task = getTaskOrThrow(taskId);
        checkTaskAccess(task, currentUser);

        User assignee = null;
        if (req.getAssigneeId() != null)
            assignee = userRepository.findById(req.getAssigneeId()).orElse(null);

        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setAssignee(assignee);
        task.setStatus(parseStatus(req.getStatus(), task.getStatus()));
        task.setPriority(parsePriority(req.getPriority(), task.getPriority()));
        task.setDueDate(req.getDueDate());

        return TaskDto.Response.from(taskRepository.save(task));
    }

    @Transactional
    public TaskDto.Response updateStatus(Long taskId, String status, User currentUser) {
        Task task = getTaskOrThrow(taskId);
        checkTaskAccess(task, currentUser);
        task.setStatus(parseStatus(status, task.getStatus()));
        return TaskDto.Response.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long taskId, User currentUser) {
        Task task = getTaskOrThrow(taskId);
        if (currentUser.getRole() != User.Role.ADMIN
            && !task.getCreatedBy().getId().equals(currentUser.getId()))
            throw new RuntimeException("Only task creator or admin can delete");
        taskRepository.delete(task);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private Task getTaskOrThrow(Long id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    private void checkTaskAccess(Task task, User user) {
        if (user.getRole() == User.Role.ADMIN) return;
        boolean isMember = memberRepository
            .existsByProjectAndUser(task.getProject(), user);
        if (!isMember) throw new RuntimeException("Access denied");
    }

    private Task.Status parseStatus(String s, Task.Status def) {
        if (s == null) return def;
        try { return Task.Status.valueOf(s.toUpperCase()); }
        catch (Exception e) { return def; }
    }

    private Task.Priority parsePriority(String p, Task.Priority def) {
        if (p == null) return def;
        try { return Task.Priority.valueOf(p.toUpperCase()); }
        catch (Exception e) { return def; }
    }
}
