package com.taskflow.dto;

import com.taskflow.entity.Project;
import com.taskflow.entity.ProjectMember;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class ProjectDto {

    @Data
    public static class Request {
        @NotBlank(message = "Project name is required")
        private String name;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private UserDto owner;
        private LocalDateTime createdAt;
        private long taskCount;
        private long memberCount;

        public static Response from(Project p, long taskCount) {
            return Response.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .owner(UserDto.from(p.getOwner()))
                .createdAt(p.getCreatedAt())
                .taskCount(taskCount)
                .memberCount(p.getMembers().size())
                .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailResponse {
        private Long id;
        private String name;
        private String description;
        private UserDto owner;
        private LocalDateTime createdAt;
        private List<MemberDto> members;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class MemberDto {
            private Long id;
            private String name;
            private String email;
            private String projectRole;

            public static MemberDto from(ProjectMember pm) {
                return MemberDto.builder()
                    .id(pm.getUser().getId())
                    .name(pm.getUser().getName())
                    .email(pm.getUser().getEmail())
                    .projectRole(pm.getRole().name())
                    .build();
            }
        }
    }

    @Data
    public static class AddMemberRequest {
        private Long userId;
        private String role;
    }
}
