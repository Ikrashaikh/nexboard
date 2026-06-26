package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DepartmentCompletionResponseDto {

    private Long departmentId;

    private String departmentName;

    private long totalTasks;

    private long completedTasks;

    private double completionPercentage;
}
