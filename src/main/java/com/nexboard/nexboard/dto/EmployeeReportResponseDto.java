package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeReportResponseDto {

    private Long employeeId;

    private String employeeName;

    private String email;

    private String departmentName;

    private long totalTasks;

    private long completedTasks;

    private long pendingTasks;

    private double readinessScore;

    private String onboardingStatus;
}
