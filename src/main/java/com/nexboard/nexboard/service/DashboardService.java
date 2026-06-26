package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.DashboardStatsResponseDto;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.entity.WorkflowTask;
import com.nexboard.nexboard.enums.TaskStatus;
import com.nexboard.nexboard.repository.EmployeeRepository;
import com.nexboard.nexboard.repository.WorkflowTaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final WorkflowTaskRepository workflowTaskRepository;

    public DashboardService(
            EmployeeRepository employeeRepository,
            WorkflowTaskRepository workflowTaskRepository) {

        this.employeeRepository = employeeRepository;
        this.workflowTaskRepository = workflowTaskRepository;
    }

    // Build high-level workforce onboarding statistics for dashboard cards.
    public DashboardStatsResponseDto getDashboardStats() {

        List<Employee> employees = employeeRepository.findAll();
        List<WorkflowTask> tasks = workflowTaskRepository.findAll();

        Map<Long, List<WorkflowTask>> tasksByEmployeeId =
                tasks.stream()
                        .filter(task -> task.getEmployee() != null)
                        .collect(Collectors.groupingBy(
                                task -> task.getEmployee().getId()));

        long totalEmployees = employees.size();
        long employeesOnboarding = 0;
        long employeesCompleted = 0;
        double totalReadinessScore = 0;

        for (Employee employee : employees) {

            List<WorkflowTask> employeeTasks =
                    tasksByEmployeeId.getOrDefault(
                            employee.getId(),
                            List.of());

            long totalTasks = employeeTasks.size();
            long completedTasks = countTasksByStatus(
                    employeeTasks,
                    TaskStatus.COMPLETED);

            if (totalTasks > 0 && completedTasks == totalTasks) {
                employeesCompleted++;
            }

            if (totalTasks > 0 && completedTasks < totalTasks) {
                employeesOnboarding++;
            }

            if (totalTasks > 0) {
                totalReadinessScore +=
                        (completedTasks * 100.0) / totalTasks;
            }
        }

        long pendingTasks = countTasksByStatus(
                tasks,
                TaskStatus.PENDING);

        long overdueTasks = tasks.stream()
                .filter(this::isTaskOverdue)
                .count();

        double averageReadinessScore = 0;
        if (totalEmployees > 0) {
            averageReadinessScore =
                    totalReadinessScore / totalEmployees;
        }

        return new DashboardStatsResponseDto(
                totalEmployees,
                employeesOnboarding,
                employeesCompleted,
                pendingTasks,
                overdueTasks,
                averageReadinessScore
        );
    }

    private long countTasksByStatus(
            List<WorkflowTask> tasks,
            TaskStatus status) {

        return tasks.stream()
                .filter(task -> task.getStatus() == status)
                .count();
    }

    private boolean isTaskOverdue(WorkflowTask task) {

        if (task.getStatus() == TaskStatus.COMPLETED
                || task.getDueDate() == null) {
            return false;
        }

        try {
            LocalDate dueDate = LocalDate.parse(task.getDueDate());
            return dueDate.isBefore(LocalDate.now());
        } catch (DateTimeParseException ex) {
            return false;
        }
    }
}
