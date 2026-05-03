package com.taskflow.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private long totalTasks;
    private long todo;
    private long inProgress;
    private long done;
    private long overdue;
    private long projects;
    private List<TaskDto.Response> recentTasks;
    private List<TaskDto.Response> overdueTasks;
    private List<TaskDto.Response> myTasks;
}
