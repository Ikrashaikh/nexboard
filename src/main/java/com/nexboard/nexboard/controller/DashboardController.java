package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.DashboardStatsResponseDto;
import com.nexboard.nexboard.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // Return high-level onboarding and workforce readiness metrics.
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public DashboardStatsResponseDto getDashboardStats() {

        return dashboardService.getDashboardStats();
    }
}
