package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.BottleneckResponseDto;
import com.nexboard.nexboard.dto.OverdueTaskResponseDto;
import com.nexboard.nexboard.dto.ReadinessResponseDto;
import com.nexboard.nexboard.dto.UpdateTaskStatusDto;
import com.nexboard.nexboard.dto.WorkflowTaskRequestDto;
import com.nexboard.nexboard.dto.WorkflowTaskResponseDto;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.entity.WorkflowTask;
import com.nexboard.nexboard.enums.TaskStatus;
import com.nexboard.nexboard.repository.EmployeeRepository;
import com.nexboard.nexboard.repository.WorkflowTaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkflowTaskService {

    private final WorkflowTaskRepository workflowTaskRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public WorkflowTaskService(
            WorkflowTaskRepository workflowTaskRepository,
            EmployeeRepository employeeRepository,
            AuditLogService auditLogService,
            NotificationService notificationService) {

        this.workflowTaskRepository = workflowTaskRepository;
        this.employeeRepository = employeeRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    // Create onboarding task for employee
    public WorkflowTaskResponseDto createTask(
            WorkflowTaskRequestDto requestDto) {

        Employee employee = employeeRepository.findById(
                        requestDto.getEmployeeId())
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        WorkflowTask task = new WorkflowTask();

        task.setTaskName(requestDto.getTaskName());
        task.setDueDate(requestDto.getDueDate());

        // Every new task starts as pending
        task.setStatus(TaskStatus.PENDING);

        task.setEmployee(employee);

        WorkflowTask savedTask =
                workflowTaskRepository.save(task);

        notificationService.sendNewTaskAssignedNotification(savedTask);

        return new WorkflowTaskResponseDto(
                savedTask.getId(),
                savedTask.getTaskName(),
                savedTask.getStatus().name(),
                savedTask.getDueDate(),
                employee.getFirstName()
        );
    }

    // Fetch all tasks assigned to employee
    public List<WorkflowTaskResponseDto> getTasksByEmployee(
            Long employeeId) {

        return workflowTaskRepository
                .findByEmployeeId(employeeId)
                .stream()
                .map(task ->
                        new WorkflowTaskResponseDto(
                                task.getId(),
                                task.getTaskName(),
                                task.getStatus().name(),
                                task.getDueDate(),
                                task.getEmployee().getFirstName()
                        ))
                .toList();
    }

    // Calculate onboarding readiness score
    public ReadinessResponseDto calculateReadinessScore(
            Long employeeId) {

        long totalTasks =
                workflowTaskRepository.countByEmployeeId(employeeId);

        long completedTasks =
                workflowTaskRepository.countByEmployeeIdAndStatus(
                        employeeId,
                        TaskStatus.COMPLETED);

        double readinessScore = 0;

        // Avoid division by zero
        if (totalTasks > 0) {
            readinessScore =
                    (completedTasks * 100.0) / totalTasks;
        }

        return new ReadinessResponseDto(
                employeeId,
                readinessScore,
                completedTasks,
                totalTasks
        );
    }

    // Update onboarding task status
    public WorkflowTaskResponseDto updateTaskStatus(
            Long taskId,
            UpdateTaskStatusDto requestDto) {

        WorkflowTask task = workflowTaskRepository
                .findById(taskId)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));

        // Update task status
        task.setStatus(requestDto.getStatus());

        if (requestDto.getStatus() == TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }

        WorkflowTask updatedTask =
                workflowTaskRepository.save(task);

        if (updatedTask.getStatus() == TaskStatus.COMPLETED
                && hasCompletedOnboarding(updatedTask.getEmployee())) {
            notificationService.sendCompletedOnboardingNotification(
                    updatedTask.getEmployee());
        }

        // Record task status update activity
        auditLogService.saveAuditLog(
                "TASK_STATUS_UPDATED",
                "Task " + updatedTask.getTaskName()
                        + " moved to "
                        + updatedTask.getStatus(),
                java.time.LocalDateTime.now().toString()
        );

        return new WorkflowTaskResponseDto(
                updatedTask.getId(),
                updatedTask.getTaskName(),
                updatedTask.getStatus().name(),
                updatedTask.getDueDate(),
                updatedTask.getEmployee().getFirstName()
        );
    }

    // Find onboarding tasks that missed their deadline
    public List<OverdueTaskResponseDto> getOverdueTasks() {

        List<WorkflowTask> tasks =
                workflowTaskRepository.findAll();

        List<OverdueTaskResponseDto> overdueTasks =
                new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (WorkflowTask task : tasks) {

            LocalDate dueDate =
                    LocalDate.parse(task.getDueDate());

            if (dueDate.isBefore(today)
                    && task.getStatus() != TaskStatus.COMPLETED) {

                overdueTasks.add(
                        new OverdueTaskResponseDto(
                                task.getId(),
                                task.getTaskName(),
                                task.getEmployee().getFirstName(),
                                task.getDueDate(),
                                task.getStatus().name()
                        )
                );
            }
        }

        return overdueTasks;
    }

    // Identify onboarding stage with maximum pending tasks
    public BottleneckResponseDto getBottleneckStage() {

        Map<String, Long> pendingTaskCountMap =
                workflowTaskRepository.findAll()
                        .stream()
                        .filter(task ->
                                task.getStatus() == TaskStatus.PENDING)
                        .collect(Collectors.groupingBy(
                                WorkflowTask::getTaskName,
                                Collectors.counting()
                        ));

        String bottleneckTask = "";
        long maxCount = 0;

        for (Map.Entry<String, Long> entry :
                pendingTaskCountMap.entrySet()) {

            if (entry.getValue() > maxCount) {

                bottleneckTask = entry.getKey();
                maxCount = entry.getValue();
            }
        }

        return new BottleneckResponseDto(
                bottleneckTask,
                maxCount
        );
    }

    private boolean hasCompletedOnboarding(Employee employee) {

        List<WorkflowTask> employeeTasks =
                workflowTaskRepository.findByEmployeeId(
                        employee.getId());

        return !employeeTasks.isEmpty()
                && employeeTasks.stream()
                .allMatch(task ->
                        task.getStatus() == TaskStatus.COMPLETED);
    }
}
