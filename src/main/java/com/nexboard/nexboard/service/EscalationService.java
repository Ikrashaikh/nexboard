package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.EscalationResponseDto;
import com.nexboard.nexboard.entity.Escalation;
import com.nexboard.nexboard.entity.WorkflowTask;
import com.nexboard.nexboard.enums.EscalationStatus;
import com.nexboard.nexboard.enums.EscalationType;
import com.nexboard.nexboard.enums.TaskStatus;
import com.nexboard.nexboard.repository.EscalationRepository;
import com.nexboard.nexboard.repository.WorkflowTaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class EscalationService {

    private final EscalationRepository escalationRepository;
    private final WorkflowTaskRepository workflowTaskRepository;
    private final NotificationService notificationService;

    public EscalationService(
            EscalationRepository escalationRepository,
            WorkflowTaskRepository workflowTaskRepository,
            NotificationService notificationService) {

        this.escalationRepository = escalationRepository;
        this.workflowTaskRepository = workflowTaskRepository;
        this.notificationService = notificationService;
    }

    // Scan onboarding tasks and create escalation records for active issues.
    public List<EscalationResponseDto> generateEscalations() {

        workflowTaskRepository.findAll()
                .forEach(this::evaluateTaskForEscalation);

        return getOpenEscalations();
    }

    public List<EscalationResponseDto> getAllEscalations() {

        return escalationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<EscalationResponseDto> getOpenEscalations() {

        return escalationRepository.findByStatus(EscalationStatus.OPEN)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EscalationResponseDto resolveEscalation(Long escalationId) {

        Escalation escalation =
                escalationRepository.findById(escalationId)
                        .orElseThrow(() ->
                                new RuntimeException("Escalation not found"));

        escalation.setStatus(EscalationStatus.RESOLVED);

        return mapToResponse(
                escalationRepository.save(escalation));
    }

    private void evaluateTaskForEscalation(WorkflowTask task) {

        if (task.getStatus() == TaskStatus.COMPLETED) {
            return;
        }

        if (isTaskOverdue(task)) {
            createEscalationIfMissing(
                    task,
                    EscalationType.OVERDUE_ONBOARDING,
                    "Onboarding task " + task.getTaskName()
                            + " is overdue for "
                            + task.getEmployee().getFirstName()
            );

            createEscalationIfMissing(
                    task,
                    EscalationType.MISSED_SLA,
                    "SLA missed for task "
                            + task.getTaskName()
                            + " due on "
                            + task.getDueDate()
            );

            notificationService.sendOverdueTaskNotification(task);
        }

        if (isPendingApproval(task)) {
            createEscalationIfMissing(
                    task,
                    EscalationType.PENDING_APPROVAL,
                    "Approval task " + task.getTaskName()
                            + " is pending for "
                            + task.getEmployee().getFirstName()
            );
        }
    }

    private void createEscalationIfMissing(
            WorkflowTask task,
            EscalationType escalationType,
            String message) {

        boolean exists = escalationRepository
                .existsByWorkflowTaskIdAndTypeAndStatus(
                        task.getId(),
                        escalationType,
                        EscalationStatus.OPEN);

        if (exists) {
            return;
        }

        Escalation escalation = new Escalation();
        escalation.setType(escalationType);
        escalation.setStatus(EscalationStatus.OPEN);
        escalation.setMessage(message);
        escalation.setCreatedAt(LocalDateTime.now());
        escalation.setEmployee(task.getEmployee());
        escalation.setWorkflowTask(task);

        escalationRepository.save(escalation);
    }

    private boolean isTaskOverdue(WorkflowTask task) {

        if (task.getDueDate() == null) {
            return false;
        }

        try {
            return LocalDate.parse(task.getDueDate())
                    .isBefore(LocalDate.now());
        } catch (DateTimeParseException ex) {
            return false;
        }
    }

    private boolean isPendingApproval(WorkflowTask task) {

        return task.getStatus() == TaskStatus.PENDING
                && task.getTaskName() != null
                && task.getTaskName()
                .toLowerCase()
                .contains("approval");
    }

    private EscalationResponseDto mapToResponse(
            Escalation escalation) {

        String employeeName = "";
        if (escalation.getEmployee() != null) {
            employeeName = escalation.getEmployee().getFirstName()
                    + " "
                    + escalation.getEmployee().getLastName();
        }

        String taskName = "";
        if (escalation.getWorkflowTask() != null) {
            taskName = escalation.getWorkflowTask().getTaskName();
        }

        return new EscalationResponseDto(
                escalation.getId(),
                escalation.getType().name(),
                escalation.getStatus().name(),
                escalation.getMessage(),
                employeeName,
                taskName,
                escalation.getCreatedAt().toString()
        );
    }
}
