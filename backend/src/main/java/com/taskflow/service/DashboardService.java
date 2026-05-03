package com.taskflow.service;

import com.taskflow.dto.DashboardDto;
import com.taskflow.dto.TaskDto;
import com.taskflow.entity.*;
import com.taskflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public DashboardDto getDashboard(User currentUser) {
        List<Project> projects = currentUser.getRole() == User.Role.ADMIN
            ? projectRepository.findAllByOrderByCreatedAtDesc()
            : projectRepository.findProjectsForUser(currentUser);

        if (projects.isEmpty()) {
            return DashboardDto.builder()
                .totalTasks(0).todo(0).inProgress(0).done(0).overdue(0).projects(0)
                .recentTasks(List.of()).overdueTasks(List.of()).myTasks(List.of())
                .build();
        }

        List<Task> allTasks = taskRepository.findByProjectsOrderByUpdatedAtDesc(projects);
        List<Task> overdueTasks = taskRepository.findOverdueTasks(projects, LocalDate.now());
        List<Task> myTasks = taskRepository.findByAssignee(currentUser);

        long todo       = allTasks.stream().filter(t -> t.getStatus() == Task.Status.TODO).count();
        long inProgress = allTasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count();
        long done       = allTasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();

        return DashboardDto.builder()
            .totalTasks(allTasks.size())
            .todo(todo)
            .inProgress(inProgress)
            .done(done)
            .overdue(overdueTasks.size())
            .projects(projects.size())
            .recentTasks(allTasks.stream().limit(10).map(TaskDto.Response::from).toList())
            .overdueTasks(overdueTasks.stream().map(TaskDto.Response::from).toList())
            .myTasks(myTasks.stream().map(TaskDto.Response::from).toList())
            .build();
    }
}
