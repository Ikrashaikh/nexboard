package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.WorkflowTaskRequestDto;
import com.nexboard.nexboard.dto.WorkflowTaskResponseDto;
import com.nexboard.nexboard.service.WorkflowTaskService;
import org.springframework.web.bind.annotation.*;
import com.nexboard.nexboard.dto.ReadinessResponseDto;
import com.nexboard.nexboard.dto.UpdateTaskStatusDto;
import com.nexboard.nexboard.dto.OverdueTaskResponseDto;
import com.nexboard.nexboard.dto.BottleneckResponseDto;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class WorkflowTaskController {

    private final WorkflowTaskService workflowTaskService;

    public WorkflowTaskController(
            WorkflowTaskService workflowTaskService) {
        this.workflowTaskService = workflowTaskService;
    }

    // Create onboarding task
    @PostMapping
    public WorkflowTaskResponseDto createTask(
            @RequestBody WorkflowTaskRequestDto requestDto) {

        return workflowTaskService.createTask(requestDto);
    }

    // Get tasks assigned to employee
    @GetMapping("/employee/{employeeId}")
    public List<WorkflowTaskResponseDto> getTasksByEmployee(
            @PathVariable Long employeeId) {

        return workflowTaskService
                .getTasksByEmployee(employeeId);
    }

    // Calculate employee readiness score
    @GetMapping("/readiness/{employeeId}")
    public ReadinessResponseDto getReadinessScore(
            @PathVariable Long employeeId) {

        return workflowTaskService
                .calculateReadinessScore(employeeId);
    }
    // Update task status
    @PutMapping("/{taskId}/status")
    public WorkflowTaskResponseDto updateTaskStatus(
            @PathVariable Long taskId,
            @RequestBody UpdateTaskStatusDto requestDto) {

        return workflowTaskService.updateTaskStatus(taskId, requestDto);
    }
    // Fetch all overdue onboarding tasks
    @GetMapping("/overdue")
    public List<OverdueTaskResponseDto> getOverdueTasks() {

        return workflowTaskService.getOverdueTasks();
    }

    // Identify onboarding bottleneck stage
    @GetMapping("/analytics/bottleneck")
    public BottleneckResponseDto getBottleneckStage() {

        return workflowTaskService.getBottleneckStage();
    }



}