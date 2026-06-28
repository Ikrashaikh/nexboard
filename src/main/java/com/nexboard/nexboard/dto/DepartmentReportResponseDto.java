package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DepartmentReportResponseDto {

    private Long departmentId;

    private String departmentName;

    private long employeeCount;

    private long totalTasks;

    private long completedTasks;

    private long pendingTasks;

    private double completionPercentage;
}
