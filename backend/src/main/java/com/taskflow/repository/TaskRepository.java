package com.taskflow.repository;

import com.taskflow.entity.Project;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectOrderByCreatedAtDesc(Project project);

    List<Task> findByAssignee(User user);

    @Query("SELECT t FROM Task t WHERE t.project IN :projects ORDER BY t.updatedAt DESC")
    List<Task> findByProjectsOrderByUpdatedAtDesc(@Param("projects") List<Project> projects);

    @Query("SELECT t FROM Task t WHERE t.project IN :projects AND t.dueDate < :today AND t.status <> 'DONE' ORDER BY t.dueDate ASC")
    List<Task> findOverdueTasks(@Param("projects") List<Project> projects,
                                @Param("today") LocalDate today);

    long countByProject(Project project);
    long countByProjectAndStatus(Project project, Task.Status status);
}