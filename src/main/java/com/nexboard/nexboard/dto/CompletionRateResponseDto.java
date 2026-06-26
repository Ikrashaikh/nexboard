package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CompletionRateResponseDto {

    private long totalEmployeesWithTasks;

    private long completedEmployees;

    private double completionRate;
}
