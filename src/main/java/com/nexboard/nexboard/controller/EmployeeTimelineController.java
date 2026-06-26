package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.EmployeeTimelineResponseDto;
import com.nexboard.nexboard.service.EmployeeTimelineService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/employee-timelines")
public class EmployeeTimelineController {

    private final EmployeeTimelineService employeeTimelineService;

    public EmployeeTimelineController(
            EmployeeTimelineService employeeTimelineService) {
        this.employeeTimelineService = employeeTimelineService;
    }

    // Return complete onboarding timeline for one employee.
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public EmployeeTimelineResponseDto getEmployeeTimeline(
            @PathVariable Long employeeId) {

        return employeeTimelineService.getEmployeeTimeline(employeeId);
    }
}
