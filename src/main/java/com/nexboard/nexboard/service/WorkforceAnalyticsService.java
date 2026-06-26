package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.AverageOnboardingDurationResponseDto;
import com.nexboard.nexboard.dto.CompletionRateResponseDto;
import com.nexboard.nexboard.dto.DepartmentCompletionResponseDto;
import com.nexboard.nexboard.dto.HiringStatsResponseDto;
import com.nexboard.nexboard.dto.OnboardingTrendResponseDto;
import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.entity.WorkflowTask;
import com.nexboard.nexboard.enums.TaskStatus;
import com.nexboard.nexboard.repository.DepartmentRepository;
import com.nexboard.nexboard.repository.EmployeeRepository;
import com.nexboard.nexboard.repository.WorkflowTaskRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.WeekFields;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
public class WorkforceAnalyticsService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final WorkflowTaskRepository workflowTaskRepository;

    public WorkforceAnalyticsService(
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository,
            WorkflowTaskRepository workflowTaskRepository) {

        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.workflowTaskRepository = workflowTaskRepository;
    }

    // Calculate onboarding task completion percentage for each department.
    public List<DepartmentCompletionResponseDto> getDepartmentCompletion() {

        List<WorkflowTask> tasks = workflowTaskRepository.findAll();

        return departmentRepository.findAll()
                .stream()
                .map(department ->
                        buildDepartmentCompletionResponse(
                                department,
                                tasks))
                .toList();
    }

    // Show weekly onboarding starts and completions.
    public List<OnboardingTrendResponseDto> getWeeklyOnboardingTrend() {

        List<Employee> employees = employeeRepository.findAll();
        Map<Long, List<WorkflowTask>> tasksByEmployeeId =
                groupTasksByEmployeeId();

        Map<String, Long> startsByWeek = employees.stream()
                .filter(employee -> employee.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        employee -> formatWeek(employee.getCreatedAt()),
                        TreeMap::new,
                        Collectors.counting()));

        Map<String, Long> completionsByWeek = employees.stream()
                .map(employee -> getEmployeeCompletionDate(
                        employee,
                        tasksByEmployeeId))
                .flatMap(Optional::stream)
                .collect(Collectors.groupingBy(
                        this::formatWeek,
                        TreeMap::new,
                        Collectors.counting()));

        return mergeTrendPeriods(startsByWeek, completionsByWeek);
    }

    // Show monthly onboarding starts and completions.
    public List<OnboardingTrendResponseDto> getMonthlyOnboardingTrend() {

        List<Employee> employees = employeeRepository.findAll();
        Map<Long, List<WorkflowTask>> tasksByEmployeeId =
                groupTasksByEmployeeId();

        Map<String, Long> startsByMonth = employees.stream()
                .filter(employee -> employee.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        employee -> formatMonth(employee.getCreatedAt()),
                        TreeMap::new,
                        Collectors.counting()));

        Map<String, Long> completionsByMonth = employees.stream()
                .map(employee -> getEmployeeCompletionDate(
                        employee,
                        tasksByEmployeeId))
                .flatMap(Optional::stream)
                .collect(Collectors.groupingBy(
                        this::formatMonth,
                        TreeMap::new,
                        Collectors.counting()));

        return mergeTrendPeriods(startsByMonth, completionsByMonth);
    }

    // Return hiring totals for common workforce reporting periods.
    public HiringStatsResponseDto getHiringStats() {

        List<Employee> employees = employeeRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate weekStart =
                today.with(WeekFields.ISO.dayOfWeek(), 1);
        YearMonth currentMonth = YearMonth.from(today);

        long totalHires = employees.size();

        long hiresThisWeek = employees.stream()
                .filter(employee -> isCreatedOnOrAfter(
                        employee,
                        weekStart))
                .count();

        long hiresThisMonth = employees.stream()
                .filter(employee -> employee.getCreatedAt() != null)
                .filter(employee -> YearMonth.from(
                        employee.getCreatedAt()).equals(currentMonth))
                .count();

        long hiresThisYear = employees.stream()
                .filter(employee -> employee.getCreatedAt() != null)
                .filter(employee -> employee.getCreatedAt()
                        .getYear() == today.getYear())
                .count();

        return new HiringStatsResponseDto(
                totalHires,
                hiresThisWeek,
                hiresThisMonth,
                hiresThisYear
        );
    }

    // Calculate completed onboarding employees over employees with tasks.
    public CompletionRateResponseDto getCompletionRate() {

        List<Employee> employees = employeeRepository.findAll();
        Map<Long, List<WorkflowTask>> tasksByEmployeeId =
                groupTasksByEmployeeId();

        long employeesWithTasks = 0;
        long completedEmployees = 0;

        for (Employee employee : employees) {

            List<WorkflowTask> employeeTasks =
                    tasksByEmployeeId.getOrDefault(
                            employee.getId(),
                            List.of());

            if (!employeeTasks.isEmpty()) {
                employeesWithTasks++;
            }

            if (hasCompletedOnboarding(employeeTasks)) {
                completedEmployees++;
            }
        }

        double completionRate = 0;
        if (employeesWithTasks > 0) {
            completionRate =
                    (completedEmployees * 100.0) / employeesWithTasks;
        }

        return new CompletionRateResponseDto(
                employeesWithTasks,
                completedEmployees,
                completionRate
        );
    }

    // Calculate average days between employee creation and onboarding completion.
    public AverageOnboardingDurationResponseDto getAverageOnboardingDuration() {

        List<Employee> employees = employeeRepository.findAll();
        Map<Long, List<WorkflowTask>> tasksByEmployeeId =
                groupTasksByEmployeeId();

        long completedEmployees = 0;
        double totalDurationDays = 0;

        for (Employee employee : employees) {

            if (employee.getCreatedAt() == null) {
                continue;
            }

            List<WorkflowTask> employeeTasks =
                    tasksByEmployeeId.getOrDefault(
                            employee.getId(),
                            List.of());

            Optional<LocalDateTime> completionDate =
                    getEmployeeCompletionDate(
                            employee,
                            tasksByEmployeeId);

            if (hasCompletedOnboarding(employeeTasks)
                    && completionDate.isPresent()) {

                completedEmployees++;
                totalDurationDays += Duration.between(
                                employee.getCreatedAt(),
                                completionDate.get())
                        .toHours() / 24.0;
            }
        }

        double averageDurationDays = 0;
        if (completedEmployees > 0) {
            averageDurationDays =
                    totalDurationDays / completedEmployees;
        }

        return new AverageOnboardingDurationResponseDto(
                completedEmployees,
                averageDurationDays
        );
    }

    private DepartmentCompletionResponseDto buildDepartmentCompletionResponse(
            Department department,
            List<WorkflowTask> tasks) {

        List<WorkflowTask> departmentTasks = tasks.stream()
                .filter(task -> task.getEmployee() != null)
                .filter(task -> task.getEmployee().getDepartment() != null)
                .filter(task -> task.getEmployee()
                        .getDepartment()
                        .getId()
                        .equals(department.getId()))
                .toList();

        long totalTasks = departmentTasks.size();
        long completedTasks = departmentTasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                .count();

        double completionPercentage = 0;
        if (totalTasks > 0) {
            completionPercentage =
                    (completedTasks * 100.0) / totalTasks;
        }

        return new DepartmentCompletionResponseDto(
                department.getId(),
                department.getName(),
                totalTasks,
                completedTasks,
                completionPercentage
        );
    }

    private Map<Long, List<WorkflowTask>> groupTasksByEmployeeId() {

        return workflowTaskRepository.findAll()
                .stream()
                .filter(task -> task.getEmployee() != null)
                .collect(Collectors.groupingBy(
                        task -> task.getEmployee().getId()));
    }

    private boolean hasCompletedOnboarding(
            List<WorkflowTask> employeeTasks) {

        return !employeeTasks.isEmpty()
                && employeeTasks.stream()
                .allMatch(task ->
                        task.getStatus() == TaskStatus.COMPLETED);
    }

    private Optional<LocalDateTime> getEmployeeCompletionDate(
            Employee employee,
            Map<Long, List<WorkflowTask>> tasksByEmployeeId) {

        List<WorkflowTask> employeeTasks =
                tasksByEmployeeId.getOrDefault(
                        employee.getId(),
                        List.of());

        if (!hasCompletedOnboarding(employeeTasks)) {
            return Optional.empty();
        }

        return employeeTasks.stream()
                .map(WorkflowTask::getCompletedAt)
                .filter(completedAt -> completedAt != null)
                .max(Comparator.naturalOrder());
    }

    private List<OnboardingTrendResponseDto> mergeTrendPeriods(
            Map<String, Long> starts,
            Map<String, Long> completions) {

        TreeMap<String, Long> allPeriods = new TreeMap<>();
        starts.keySet().forEach(period -> allPeriods.put(period, 0L));
        completions.keySet().forEach(period -> allPeriods.put(period, 0L));

        return allPeriods.keySet()
                .stream()
                .map(period -> new OnboardingTrendResponseDto(
                        period,
                        starts.getOrDefault(period, 0L),
                        completions.getOrDefault(period, 0L)
                ))
                .toList();
    }

    private String formatWeek(LocalDateTime dateTime) {

        int weekNumber = dateTime.get(
                WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());

        return dateTime.getYear() + "-W" + String.format("%02d", weekNumber);
    }

    private String formatMonth(LocalDateTime dateTime) {

        return YearMonth.from(dateTime).toString();
    }

    private boolean isCreatedOnOrAfter(
            Employee employee,
            LocalDate date) {

        return employee.getCreatedAt() != null
                && !employee.getCreatedAt()
                .toLocalDate()
                .isBefore(date);
    }
}
