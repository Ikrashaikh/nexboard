package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OnboardingProgressResponseDto {

    private Long employeeId;

    private String employeeName;

    private String departmentName;

    private long totalTasks;

    private long completedTasks;

    private long inProgressTasks;

    private long pendingTasks;

    private double progressPercentage;

    private String currentStage;
}
