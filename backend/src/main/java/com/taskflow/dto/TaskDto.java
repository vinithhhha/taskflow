package com.taskflow.dto;

import com.taskflow.entity.Task;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDto {

    @Data
    public static class Request {
        private String title;
        private String description;
        private Long assigneeId;
        private String status;
        private String priority;
        private LocalDate dueDate;
    }

    @Data
    public static class StatusRequest {
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private Long projectId;
        private String projectName;
        private UserDto assignee;
        private UserDto createdBy;
        private String status;
        private String priority;
        private LocalDate dueDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private boolean overdue;

        public static Response from(Task t) {
            boolean overdue = t.getDueDate() != null
                && t.getDueDate().isBefore(LocalDate.now())
                && t.getStatus() != Task.Status.DONE;
            return Response.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .projectId(t.getProject().getId())
                .projectName(t.getProject().getName())
                .assignee(t.getAssignee() != null ? UserDto.from(t.getAssignee()) : null)
                .createdBy(UserDto.from(t.getCreatedBy()))
                .status(t.getStatus().name())
                .priority(t.getPriority().name())
                .dueDate(t.getDueDate())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .overdue(overdue)
                .build();
        }
    }
}
