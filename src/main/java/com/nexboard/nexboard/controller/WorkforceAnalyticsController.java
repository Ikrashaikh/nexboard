package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.AverageOnboardingDurationResponseDto;
import com.nexboard.nexboard.dto.CompletionRateResponseDto;
import com.nexboard.nexboard.dto.DepartmentCompletionResponseDto;
import com.nexboard.nexboard.dto.HiringStatsResponseDto;
import com.nexboard.nexboard.dto.OnboardingTrendResponseDto;
import com.nexboard.nexboard.service.WorkforceAnalyticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/analytics")
public class WorkforceAnalyticsController {

    private final WorkforceAnalyticsService workforceAnalyticsService;

    public WorkforceAnalyticsController(
            WorkforceAnalyticsService workforceAnalyticsService) {
        this.workforceAnalyticsService = workforceAnalyticsService;
    }

    // Department-wise onboarding completion percentage.
    @GetMapping("/department-completion")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<DepartmentCompletionResponseDto> getDepartmentCompletion() {

        return workforceAnalyticsService.getDepartmentCompletion();
    }

    // Weekly onboarding start and completion trend.
    @GetMapping("/onboarding-trend/weekly")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<OnboardingTrendResponseDto> getWeeklyOnboardingTrend() {

        return workforceAnalyticsService.getWeeklyOnboardingTrend();
    }

    // Monthly onboarding start and completion trend.
    @GetMapping("/onboarding-trend/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<OnboardingTrendResponseDto> getMonthlyOnboardingTrend() {

        return workforceAnalyticsService.getMonthlyOnboardingTrend();
    }

    // Hiring totals across current reporting periods.
    @GetMapping("/hiring")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public HiringStatsResponseDto getHiringStats() {

        return workforceAnalyticsService.getHiringStats();
    }

    // Overall onboarding completion rate.
    @GetMapping("/completion-rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public CompletionRateResponseDto getCompletionRate() {

        return workforceAnalyticsService.getCompletionRate();
    }

    // Average onboarding duration for completed employees.
    @GetMapping("/average-duration")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public AverageOnboardingDurationResponseDto getAverageOnboardingDuration() {

        return workforceAnalyticsService.getAverageOnboardingDuration();
    }
}
