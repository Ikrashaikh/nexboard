package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.OnboardingProgressResponseDto;
import com.nexboard.nexboard.dto.WorkflowStageRequestDto;
import com.nexboard.nexboard.dto.WorkflowTaskResponseDto;
import com.nexboard.nexboard.dto.WorkflowTemplateRequestDto;
import com.nexboard.nexboard.dto.WorkflowTemplateResponseDto;
import com.nexboard.nexboard.service.WorkflowTemplateService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workflow-templates")
public class WorkflowTemplateController {

    private final WorkflowTemplateService workflowTemplateService;

    public WorkflowTemplateController(
            WorkflowTemplateService workflowTemplateService) {
        this.workflowTemplateService = workflowTemplateService;
    }

    // Create a department-specific workflow template.
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public WorkflowTemplateResponseDto createTemplate(
            @RequestBody WorkflowTemplateRequestDto requestDto) {

        return workflowTemplateService.createTemplate(requestDto);
    }

    // Add an ordered onboarding stage to a template.
    @PostMapping("/{templateId}/stages")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public WorkflowTemplateResponseDto addStageToTemplate(
            @PathVariable Long templateId,
            @RequestBody WorkflowStageRequestDto requestDto) {

        return workflowTemplateService.addStageToTemplate(
                templateId,
                requestDto);
    }

    // Fetch all workflow templates.
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<WorkflowTemplateResponseDto> getAllTemplates() {

        return workflowTemplateService.getAllTemplates();
    }

    // Fetch workflow template details.
    @GetMapping("/{templateId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public WorkflowTemplateResponseDto getTemplateById(
            @PathVariable Long templateId) {

        return workflowTemplateService.getTemplateById(templateId);
    }

    // Manually assign the active department workflow to an employee.
    @PostMapping("/assign/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<WorkflowTaskResponseDto> assignWorkflowToEmployee(
            @PathVariable Long employeeId) {

        return workflowTemplateService.assignWorkflowToEmployee(employeeId);
    }

    // Fetch employee onboarding progress.
    @GetMapping("/progress/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public OnboardingProgressResponseDto getEmployeeOnboardingProgress(
            @PathVariable Long employeeId) {

        return workflowTemplateService
                .getEmployeeOnboardingProgress(employeeId);
    }
}
