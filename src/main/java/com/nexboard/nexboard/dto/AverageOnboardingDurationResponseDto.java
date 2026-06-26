package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AverageOnboardingDurationResponseDto {

    private long completedEmployees;

    private double averageDurationDays;
}
