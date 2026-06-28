package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ReadinessReportResponseDto {

    private Long employeeId;

    private String employeeName;

    private String departmentName;

    private long totalTasks;

    private long completedTasks;

    private double readinessScore;
}
