package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.AuditReportResponseDto;
import com.nexboard.nexboard.dto.DepartmentReportResponseDto;
import com.nexboard.nexboard.dto.EmployeeReportResponseDto;
import com.nexboard.nexboard.dto.ReadinessReportResponseDto;
import com.nexboard.nexboard.dto.SlaReportResponseDto;
import com.nexboard.nexboard.service.ReportService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // Generate employee onboarding report.
    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<EmployeeReportResponseDto> generateEmployeeReport() {

        return reportService.generateEmployeeReport();
    }

    // Generate department workforce report.
    @GetMapping("/departments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<DepartmentReportResponseDto> generateDepartmentReport() {

        return reportService.generateDepartmentReport();
    }

    // Generate SLA compliance report.
    @GetMapping("/sla")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<SlaReportResponseDto> generateSlaReport() {

        return reportService.generateSlaReport();
    }

    // Generate readiness score report.
    @GetMapping("/readiness")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<ReadinessReportResponseDto> generateReadinessReport() {

        return reportService.generateReadinessReport();
    }

    // Generate audit trail report.
    @GetMapping("/audit")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<AuditReportResponseDto> generateAuditReport() {

        return reportService.generateAuditReport();
    }
}
