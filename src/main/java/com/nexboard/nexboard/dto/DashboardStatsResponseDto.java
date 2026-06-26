package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DashboardStatsResponseDto {

    private long totalEmployees;

    private long employeesOnboarding;

    private long employeesCompleted;

    private long pendingTasks;

    private long overdueTasks;

    private double averageReadinessScore;
}
