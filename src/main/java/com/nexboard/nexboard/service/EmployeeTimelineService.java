package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.EmployeeTimelineEventResponseDto;
import com.nexboard.nexboard.dto.EmployeeTimelineResponseDto;
import com.nexboard.nexboard.entity.ApprovalRequest;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.entity.EmployeeDocument;
import com.nexboard.nexboard.entity.WorkflowTask;
import com.nexboard.nexboard.enums.ApprovalStatus;
import com.nexboard.nexboard.enums.TaskStatus;
import com.nexboard.nexboard.exception.EmployeeNotFoundException;
import com.nexboard.nexboard.repository.ApprovalRequestRepository;
import com.nexboard.nexboard.repository.EmployeeDocumentRepository;
import com.nexboard.nexboard.repository.EmployeeRepository;
import com.nexboard.nexboard.repository.WorkflowTaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class EmployeeTimelineService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final ApprovalRequestRepository approvalRequestRepository;
    private final WorkflowTaskRepository workflowTaskRepository;

    public EmployeeTimelineService(
            EmployeeRepository employeeRepository,
            EmployeeDocumentRepository employeeDocumentRepository,
            ApprovalRequestRepository approvalRequestRepository,
            WorkflowTaskRepository workflowTaskRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeDocumentRepository = employeeDocumentRepository;
        this.approvalRequestRepository = approvalRequestRepository;
        this.workflowTaskRepository = workflowTaskRepository;
    }

    // Generate a complete onboarding timeline from employee, document, approval, and task events.
    public EmployeeTimelineResponseDto getEmployeeTimeline(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + employeeId));

        List<EmployeeTimelineEvent> timelineEvents = new ArrayList<>();
        List<EmployeeDocument> documents =
                employeeDocumentRepository.findByEmployeeId(employeeId);
        List<ApprovalRequest> approvals =
                approvalRequestRepository.findByEmployeeId(employeeId);
        List<WorkflowTask> tasks =
                workflowTaskRepository.findByEmployeeId(employeeId);

        addOfferAcceptedEvent(employee, timelineEvents);
        addDocumentEvents(documents, timelineEvents);
        addApprovalEvents(approvals, timelineEvents);
        addWorkflowTaskEvents(tasks, timelineEvents);
        addOnboardingCompletedEvent(employee, tasks, approvals, timelineEvents);

        List<EmployeeTimelineEventResponseDto> timeline =
                timelineEvents.stream()
                        .sorted(Comparator.comparing(
                                EmployeeTimelineEvent::occurredAt,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder())))
                        .map(this::mapToResponse)
                        .toList();

        return new EmployeeTimelineResponseDto(
                employee.getId(),
                employee.getFirstName() + " " + employee.getLastName(),
                employee.getDepartment().getName(),
                timeline
        );
    }

    private void addOfferAcceptedEvent(
            Employee employee,
            List<EmployeeTimelineEvent> timelineEvents) {

        timelineEvents.add(new EmployeeTimelineEvent(
                "Offer Accepted",
                "EMPLOYEE",
                "COMPLETED",
                "Employee profile created and offer accepted.",
                employee.getCreatedAt()
        ));
    }

    private void addDocumentEvents(
            List<EmployeeDocument> documents,
            List<EmployeeTimelineEvent> timelineEvents) {

        if (!documents.isEmpty()) {
            LocalDateTime firstUploadTime = documents.stream()
                    .map(EmployeeDocument::getUploadedAt)
                    .filter(uploadedAt -> uploadedAt != null)
                    .min(Comparator.naturalOrder())
                    .orElse(null);

            timelineEvents.add(new EmployeeTimelineEvent(
                    "Documents Uploaded",
                    "DOCUMENT",
                    "COMPLETED",
                    documents.size()
                            + " employee document record(s) uploaded.",
                    firstUploadTime
            ));
        }

        documents.forEach(document ->
                timelineEvents.add(new EmployeeTimelineEvent(
                        formatDocumentName(document),
                        "DOCUMENT",
                        document.getVerificationStatus().name(),
                        "Document verification status is "
                                + document.getVerificationStatus().name(),
                        document.getVerifiedAt() == null
                                ? document.getUploadedAt()
                                : document.getVerifiedAt()
                )));
    }

    private void addApprovalEvents(
            List<ApprovalRequest> approvals,
            List<EmployeeTimelineEvent> timelineEvents) {

        approvals.forEach(approval ->
                timelineEvents.add(new EmployeeTimelineEvent(
                        formatApprovalName(approval),
                        "APPROVAL",
                        approval.getStatus().name(),
                        approval.getRemarks(),
                        approval.getDecidedAt() == null
                                ? approval.getCreatedAt()
                                : approval.getDecidedAt()
                )));
    }

    private void addWorkflowTaskEvents(
            List<WorkflowTask> tasks,
            List<EmployeeTimelineEvent> timelineEvents) {

        tasks.forEach(task ->
                timelineEvents.add(new EmployeeTimelineEvent(
                        task.getTaskName(),
                        "WORKFLOW_TASK",
                        task.getStatus().name(),
                        "Workflow task status is "
                                + task.getStatus().name(),
                        task.getCompletedAt()
                )));
    }

    private void addOnboardingCompletedEvent(
            Employee employee,
            List<WorkflowTask> tasks,
            List<ApprovalRequest> approvals,
            List<EmployeeTimelineEvent> timelineEvents) {

        if (!isOnboardingCompleted(tasks, approvals)) {
            return;
        }

        LocalDateTime completedAt = tasks.stream()
                .map(WorkflowTask::getCompletedAt)
                .filter(taskCompletedAt -> taskCompletedAt != null)
                .max(Comparator.naturalOrder())
                .orElse(employee.getCreatedAt());

        timelineEvents.add(new EmployeeTimelineEvent(
                "Onboarding Completed",
                "ONBOARDING",
                "COMPLETED",
                "All onboarding tasks and approval checkpoints are completed.",
                completedAt
        ));
    }

    private boolean isOnboardingCompleted(
            List<WorkflowTask> tasks,
            List<ApprovalRequest> approvals) {

        boolean tasksCompleted = !tasks.isEmpty()
                && tasks.stream()
                .allMatch(task ->
                        task.getStatus() == TaskStatus.COMPLETED);

        boolean approvalsCompleted = approvals.isEmpty()
                || approvals.stream()
                .allMatch(approval ->
                        approval.getStatus() == ApprovalStatus.APPROVED);

        return tasksCompleted && approvalsCompleted;
    }

    private String formatDocumentName(EmployeeDocument document) {

        return document.getDocumentType()
                .name()
                .replace("_", " ");
    }

    private String formatApprovalName(ApprovalRequest approval) {

        return approval.getApprovalType()
                .name()
                .replace("_", " ");
    }

    private EmployeeTimelineEventResponseDto mapToResponse(
            EmployeeTimelineEvent event) {

        return new EmployeeTimelineEventResponseDto(
                event.eventName(),
                event.eventType(),
                event.status(),
                event.description(),
                event.occurredAt() == null
                        ? null
                        : event.occurredAt().toString()
        );
    }

    private record EmployeeTimelineEvent(
            String eventName,
            String eventType,
            String status,
            String description,
            LocalDateTime occurredAt) {
    }
}
