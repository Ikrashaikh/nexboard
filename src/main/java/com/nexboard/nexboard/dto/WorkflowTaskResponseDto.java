package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class WorkflowTaskResponseDto {

    private Long id;

    private String taskName;

    private String status;

    private String dueDate;

    private String employeeName;
}