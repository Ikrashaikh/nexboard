package com.nexboard.nexboard.dto;

import lombok.Getter;
import lombok.Setter;

// Request DTO for creating onboarding tasks
@Getter
@Setter
public class WorkflowTaskRequestDto {

    private String taskName;

    private String dueDate;

    private Long employeeId;
}