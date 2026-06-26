package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.OnboardingProgressResponseDto;
import com.nexboard.nexboard.dto.WorkflowStageRequestDto;
import com.nexboard.nexboard.dto.WorkflowStageResponseDto;
import com.nexboard.nexboard.dto.WorkflowTaskResponseDto;
import com.nexboard.nexboard.dto.WorkflowTemplateRequestDto;
import com.nexboard.nexboard.dto.WorkflowTemplateResponseDto;
import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.entity.WorkflowStage;
import com.nexboard.nexboard.entity.WorkflowTask;
import com.nexboard.nexboard.entity.WorkflowTemplate;
import com.nexboard.nexboard.enums.TaskStatus;
import com.nexboard.nexboard.exception.EmployeeNotFoundException;
import com.nexboard.nexboard.repository.DepartmentRepository;
import com.nexboard.nexboard.repository.EmployeeRepository;
import com.nexboard.nexboard.repository.WorkflowStageRepository;
import com.nexboard.nexboard.repository.WorkflowTaskRepository;
import com.nexboard.nexboard.repository.WorkflowTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class WorkflowTemplateService {

    private final WorkflowTemplateRepository workflowTemplateRepository;
    private final WorkflowStageRepository workflowStageRepository;
    private final WorkflowTaskRepository workflowTaskRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public WorkflowTemplateService(
            WorkflowTemplateRepository workflowTemplateRepository,
            WorkflowStageRepository workflowStageRepository,
            WorkflowTaskRepository workflowTaskRepository,
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository,
            AuditLogService auditLogService,
            NotificationService notificationService) {

        this.workflowTemplateRepository = workflowTemplateRepository;
        this.workflowStageRepository = workflowStageRepository;
        this.workflowTaskRepository = workflowTaskRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    // Create a department-specific onboarding workflow template.
    @Transactional
    public WorkflowTemplateResponseDto createTemplate(
            WorkflowTemplateRequestDto requestDto) {

        Department department = departmentRepository.findById(
                        requestDto.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        WorkflowTemplate workflowTemplate = new WorkflowTemplate();
        workflowTemplate.setName(requestDto.getName());
        workflowTemplate.setDescription(requestDto.getDescription());
        workflowTemplate.setActive(requestDto.isActive());
        workflowTemplate.setCreatedAt(LocalDateTime.now());
        workflowTemplate.setDepartment(department);

        WorkflowTemplate savedTemplate =
                workflowTemplateRepository.save(workflowTemplate);

        return mapTemplateToResponse(savedTemplate);
    }

    // Add a stage to an existing workflow template.
    @Transactional
    public WorkflowTemplateResponseDto addStageToTemplate(
            Long templateId,
            WorkflowStageRequestDto requestDto) {

        WorkflowTemplate workflowTemplate =
                workflowTemplateRepository.findById(templateId)
                        .orElseThrow(() ->
                                new RuntimeException("Workflow template not found"));

        WorkflowStage stage = new WorkflowStage();
        stage.setStageName(requestDto.getStageName());
        stage.setDescription(requestDto.getDescription());
        stage.setSequenceNumber(requestDto.getSequenceNumber());
        stage.setDueInDays(requestDto.getDueInDays());
        stage.setWorkflowTemplate(workflowTemplate);

        workflowStageRepository.save(stage);

        auditLogService.saveAuditLog(
                "WORKFLOW_STAGE_ADDED",
                "Stage " + stage.getStageName()
                        + " added to template "
                        + workflowTemplate.getName(),
                LocalDateTime.now().toString()
        );

        return getTemplateById(templateId);
    }

    // Fetch all configured workflow templates.
    public List<WorkflowTemplateResponseDto> getAllTemplates() {

        return workflowTemplateRepository.findAll()
                .stream()
                .map(this::mapTemplateToResponse)
                .toList();
    }

    // Fetch one workflow template with its ordered stages.
    public WorkflowTemplateResponseDto getTemplateById(Long templateId) {

        WorkflowTemplate workflowTemplate =
                workflowTemplateRepository.findById(templateId)
                        .orElseThrow(() ->
                                new RuntimeException("Workflow template not found"));

        return mapTemplateToResponse(workflowTemplate);
    }

    // Generate onboarding tasks from the active department template.
    @Transactional
    public List<WorkflowTaskResponseDto> assignWorkflowToEmployee(
            Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + employeeId));

        WorkflowTemplate workflowTemplate =
                workflowTemplateRepository
                        .findFirstByDepartmentIdAndActiveTrue(
                                employee.getDepartment().getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Active workflow template not found for department"));

        List<WorkflowStage> stages =
                workflowStageRepository
                        .findByWorkflowTemplateIdOrderBySequenceNumberAsc(
                                workflowTemplate.getId());

        List<WorkflowTask> tasks = stages.stream()
                .filter(stage -> !workflowTaskRepository
                        .existsByEmployeeIdAndWorkflowStageId(
                                employee.getId(),
                                stage.getId()))
                .map(stage -> createTaskFromStage(employee, stage))
                .toList();

        if (tasks.isEmpty()) {
            return workflowTaskRepository
                    .findByEmployeeIdAndWorkflowStageWorkflowTemplateId(
                            employee.getId(),
                            workflowTemplate.getId())
                    .stream()
                    .map(this::mapTaskToResponse)
                    .toList();
        }

        List<WorkflowTask> savedTasks =
                workflowTaskRepository.saveAll(tasks);

        savedTasks.forEach(
                notificationService::sendNewTaskAssignedNotification);

        auditLogService.saveAuditLog(
                "WORKFLOW_ASSIGNED",
                "Workflow " + workflowTemplate.getName()
                        + " assigned to employee "
                        + employee.getFirstName(),
                LocalDateTime.now().toString()
        );

        return savedTasks.stream()
                .map(this::mapTaskToResponse)
                .toList();
    }

    // Auto assign workflow during employee creation when a template exists.
    @Transactional
    public void autoAssignWorkflowToEmployee(Employee employee) {

        workflowTemplateRepository
                .findFirstByDepartmentIdAndActiveTrue(
                        employee.getDepartment().getId())
                .ifPresent(workflowTemplate -> {
                    List<WorkflowStage> stages =
                            workflowStageRepository
                                    .findByWorkflowTemplateIdOrderBySequenceNumberAsc(
                                            workflowTemplate.getId());

                    List<WorkflowTask> tasks = stages.stream()
                            .filter(stage -> !workflowTaskRepository
                                    .existsByEmployeeIdAndWorkflowStageId(
                                            employee.getId(),
                                            stage.getId()))
                            .map(stage -> createTaskFromStage(employee, stage))
                            .toList();

                    if (tasks.isEmpty()) {
                        return;
                    }

                    List<WorkflowTask> savedTasks =
                            workflowTaskRepository.saveAll(tasks);

                    savedTasks.forEach(
                            notificationService::sendNewTaskAssignedNotification);

                    auditLogService.saveAuditLog(
                            "WORKFLOW_AUTO_ASSIGNED",
                            "Workflow " + workflowTemplate.getName()
                                    + " auto assigned to employee "
                                    + employee.getFirstName(),
                            LocalDateTime.now().toString()
                    );
                });
    }

    // Calculate employee onboarding progress across assigned tasks.
    public OnboardingProgressResponseDto getEmployeeOnboardingProgress(
            Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + employeeId));

        List<WorkflowTask> tasks =
                workflowTaskRepository.findByEmployeeId(employeeId);

        long totalTasks = tasks.size();
        long completedTasks = countByStatus(tasks, TaskStatus.COMPLETED);
        long inProgressTasks = countByStatus(tasks, TaskStatus.IN_PROGRESS);
        long pendingTasks = countByStatus(tasks, TaskStatus.PENDING);

        double progressPercentage = 0;
        if (totalTasks > 0) {
            progressPercentage =
                    (completedTasks * 100.0) / totalTasks;
        }

        String currentStage = tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .min(Comparator.comparing(task ->
                        task.getWorkflowStage() == null
                                ? Integer.MAX_VALUE
                                : getSequenceNumber(task.getWorkflowStage())))
                .map(WorkflowTask::getTaskName)
                .orElse("COMPLETED");

        return new OnboardingProgressResponseDto(
                employee.getId(),
                employee.getFirstName() + " " + employee.getLastName(),
                employee.getDepartment().getName(),
                totalTasks,
                completedTasks,
                inProgressTasks,
                pendingTasks,
                progressPercentage,
                currentStage
        );
    }

    private WorkflowTask createTaskFromStage(
            Employee employee,
            WorkflowStage stage) {

        WorkflowTask task = new WorkflowTask();
        task.setTaskName(stage.getStageName());
        task.setStatus(TaskStatus.PENDING);
        task.setDueDate(LocalDate.now()
                .plusDays(getDueInDays(stage))
                .toString());
        task.setEmployee(employee);
        task.setWorkflowStage(stage);

        return task;
    }

    private int getDueInDays(WorkflowStage stage) {

        if (stage.getDueInDays() == null) {
            return 0;
        }

        return stage.getDueInDays();
    }

    private int getSequenceNumber(WorkflowStage stage) {

        if (stage.getSequenceNumber() == null) {
            return Integer.MAX_VALUE;
        }

        return stage.getSequenceNumber();
    }

    private long countByStatus(
            List<WorkflowTask> tasks,
            TaskStatus status) {

        return tasks.stream()
                .filter(task -> task.getStatus() == status)
                .count();
    }

    private WorkflowTemplateResponseDto mapTemplateToResponse(
            WorkflowTemplate workflowTemplate) {

        List<WorkflowStageResponseDto> stages =
                workflowStageRepository
                        .findByWorkflowTemplateIdOrderBySequenceNumberAsc(
                                workflowTemplate.getId())
                        .stream()
                        .map(stage -> new WorkflowStageResponseDto(
                                stage.getId(),
                                stage.getStageName(),
                                stage.getDescription(),
                                stage.getSequenceNumber(),
                                stage.getDueInDays()
                        ))
                        .toList();

        return new WorkflowTemplateResponseDto(
                workflowTemplate.getId(),
                workflowTemplate.getName(),
                workflowTemplate.getDescription(),
                workflowTemplate.getDepartment().getName(),
                workflowTemplate.isActive(),
                stages
        );
    }

    private WorkflowTaskResponseDto mapTaskToResponse(
            WorkflowTask task) {

        return new WorkflowTaskResponseDto(
                task.getId(),
                task.getTaskName(),
                task.getStatus().name(),
                task.getDueDate(),
                task.getEmployee().getFirstName()
        );
    }
}
