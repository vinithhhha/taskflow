package com.taskflow.repository;

import com.taskflow.entity.Project;
import com.taskflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT DISTINCT p FROM Project p
        LEFT JOIN p.members m
        WHERE p.owner = :user OR m.user = :user
        ORDER BY p.createdAt DESC
    """)
    List<Project> findProjectsForUser(@Param("user") User user);
}
