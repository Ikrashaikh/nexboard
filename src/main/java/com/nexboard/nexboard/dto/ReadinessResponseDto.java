package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ReadinessResponseDto {

    private Long employeeId;

    private double readinessScore;

    private long completedTasks;

    private long totalTasks;
}