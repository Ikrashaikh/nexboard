package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OnboardingTrendResponseDto {

    private String period;

    private long employeesStarted;

    private long employeesCompleted;
}
