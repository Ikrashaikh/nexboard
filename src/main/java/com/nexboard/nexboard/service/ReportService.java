package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.AuditReportResponseDto;
import com.nexboard.nexboard.dto.DepartmentReportResponseDto;
import com.nexboard.nexboard.dto.EmployeeReportResponseDto;
import com.nexboard.nexboard.dto.ReadinessReportResponseDto;
import com.nexboard.nexboard.dto.SlaReportResponseDto;
import com.nexboard.nexboard.entity.AuditLog;
import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.entity.WorkflowTask;
import com.nexboard.nexboard.enums.TaskStatus;
import com.nexboard.nexboard.repository.AuditLogRepository;
import com.nexboard.nexboard.repository.DepartmentRepository;
import com.nexboard.nexboard.repository.EmployeeRepository;
import com.nexboard.nexboard.repository.WorkflowTaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final WorkflowTaskRepository workflowTaskRepository;
    private final AuditLogRepository auditLogRepository;

    public ReportService(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            WorkflowTaskRepository workflowTaskRepository,
            AuditLogRepository auditLogRepository) {

        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.workflowTaskRepository = workflowTaskRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // Generate employee onboarding status and readiness report.
    public List<EmployeeReportResponseDto> generateEmployeeReport() {

        Map<Long, List<WorkflowTask>> tasksByEmployee =
                groupTasksByEmployeeId();

        return employeeRepository.findAll()
                .stream()
                .map(employee -> mapEmployeeReport(
                        employee,
                        tasksByEmployee.getOrDefault(
                                employee.getId(),
                                List.of())))
                .toList();
    }

    // Generate department-level workforce and task completion report.
    public List<DepartmentReportResponseDto> generateDepartmentReport() {

        List<Employee> employees = employeeRepository.findAll();
        List<WorkflowTask> tasks = workflowTaskRepository.findAll();

        return departmentRepository.findAll()
                .stream()
                .map(department -> mapDepartmentReport(
                        department,
                        employees,
                        tasks))
                .toList();
    }

    // Generate SLA report for all onboarding tasks.
    public List<SlaReportResponseDto> generateSlaReport() {

        return workflowTaskRepository.findAll()
                .stream()
                .map(this::mapSlaReport)
                .toList();
    }

    // Generate readiness score report for every employee.
    public List<ReadinessReportResponseDto> generateReadinessReport() {

        Map<Long, List<WorkflowTask>> tasksByEmployee =
                groupTasksByEmployeeId();

        return employeeRepository.findAll()
                .stream()
                .map(employee -> mapReadinessReport(
                        employee,
                        tasksByEmployee.getOrDefault(
                                employee.getId(),
                                List.of())))
                .toList();
    }

    // Generate audit report from stored audit trail records.
    public List<AuditReportResponseDto> generateAuditReport() {

        return auditLogRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(
                        AuditLog::getId,
                        Comparator.reverseOrder()))
                .map(auditLog -> new AuditReportResponseDto(
                        auditLog.getId(),
                        auditLog.getAction(),
                        auditLog.getDescription(),
                        auditLog.getTimestamp()
                ))
                .toList();
    }

    private EmployeeReportResponseDto mapEmployeeReport(
            Employee employee,
            List<WorkflowTask> tasks) {

        long totalTasks = tasks.size();
        long completedTasks = countTasksByStatus(
                tasks,
                TaskStatus.COMPLETED);
        long pendingTasks = countTasksByStatus(
                tasks,
                TaskStatus.PENDING);
        double readinessScore = calculateReadinessScore(
                totalTasks,
                completedTasks);

        return new EmployeeReportResponseDto(
                employee.getId(),
                getEmployeeName(employee),
                employee.getEmail(),
                getDepartmentName(employee),
                totalTasks,
                completedTasks,
                pendingTasks,
                readinessScore,
                getOnboardingStatus(totalTasks, completedTasks)
        );
    }

    private DepartmentReportResponseDto mapDepartmentReport(
            Department department,
            List<Employee> employees,
            List<WorkflowTask> tasks) {

        List<Employee> departmentEmployees = employees.stream()
                .filter(employee -> employee.getDepartment() != null)
                .filter(employee -> employee.getDepartment()
                        .getId()
                        .equals(department.getId()))
                .toList();

        List<Long> employeeIds = departmentEmployees.stream()
                .map(Employee::getId)
                .toList();

        List<WorkflowTask> departmentTasks = tasks.stream()
                .filter(task -> task.getEmployee() != null)
                .filter(task -> employeeIds.contains(
                        task.getEmployee().getId()))
                .toList();

        long totalTasks = departmentTasks.size();
        long completedTasks = countTasksByStatus(
                departmentTasks,
                TaskStatus.COMPLETED);
        long pendingTasks = countTasksByStatus(
                departmentTasks,
                TaskStatus.PENDING);

        return new DepartmentReportResponseDto(
                department.getId(),
                department.getName(),
                departmentEmployees.size(),
                totalTasks,
                completedTasks,
                pendingTasks,
                calculateReadinessScore(totalTasks, completedTasks)
        );
    }

    private SlaReportResponseDto mapSlaReport(WorkflowTask task) {

        boolean slaMissed = isSlaMissed(task);

        return new SlaReportResponseDto(
                task.getId(),
                task.getTaskName(),
                getEmployeeName(task.getEmployee()),
                getDepartmentName(task.getEmployee()),
                task.getDueDate(),
                task.getStatus().name(),
                slaMissed,
                calculateOverdueDays(task)
        );
    }

    private ReadinessReportResponseDto mapReadinessReport(
            Employee employee,
            List<WorkflowTask> tasks) {

        long totalTasks = tasks.size();
        long completedTasks = countTasksByStatus(
                tasks,
                TaskStatus.COMPLETED);

        return new ReadinessReportResponseDto(
                employee.getId(),
                getEmployeeName(employee),
                getDepartmentName(employee),
                totalTasks,
                completedTasks,
                calculateReadinessScore(totalTasks, completedTasks)
        );
    }

    private Map<Long, List<WorkflowTask>> groupTasksByEmployeeId() {

        return workflowTaskRepository.findAll()
                .stream()
                .filter(task -> task.getEmployee() != null)
                .collect(Collectors.groupingBy(
                        task -> task.getEmployee().getId()));
    }

    private long countTasksByStatus(
            List<WorkflowTask> tasks,
            TaskStatus status) {

        return tasks.stream()
                .filter(task -> task.getStatus() == status)
                .count();
    }

    private double calculateReadinessScore(
            long totalTasks,
            long completedTasks) {

        if (totalTasks == 0) {
            return 0;
        }

        return (completedTasks * 100.0) / totalTasks;
    }

    private String getOnboardingStatus(
            long totalTasks,
            long completedTasks) {

        if (totalTasks == 0) {
            return "NOT_STARTED";
        }

        if (completedTasks == totalTasks) {
            return "COMPLETED";
        }

        return "IN_PROGRESS";
    }

    private boolean isSlaMissed(WorkflowTask task) {

        return task.getStatus() != TaskStatus.COMPLETED
                && calculateOverdueDays(task) > 0;
    }

    private long calculateOverdueDays(WorkflowTask task) {

        if (task.getDueDate() == null) {
            return 0;
        }

        try {
            LocalDate dueDate = LocalDate.parse(task.getDueDate());
            if (!dueDate.isBefore(LocalDate.now())) {
                return 0;
            }

            return ChronoUnit.DAYS.between(
                    dueDate,
                    LocalDate.now());
        } catch (DateTimeParseException ex) {
            return 0;
        }
    }

    private String getEmployeeName(Employee employee) {

        if (employee == null) {
            return "";
        }

        return employee.getFirstName()
                + " "
                + employee.getLastName();
    }

    private String getDepartmentName(Employee employee) {

        if (employee == null || employee.getDepartment() == null) {
            return "";
        }

        return employee.getDepartment().getName();
    }
}
