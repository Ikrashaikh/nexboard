package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.ApprovalDecisionRequestDto;
import com.nexboard.nexboard.dto.ApprovalHistoryResponseDto;
import com.nexboard.nexboard.dto.ApprovalRequestResponseDto;
import com.nexboard.nexboard.entity.ApprovalHistory;
import com.nexboard.nexboard.entity.ApprovalRequest;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.enums.ApprovalStatus;
import com.nexboard.nexboard.enums.ApprovalType;
import com.nexboard.nexboard.exception.EmployeeNotFoundException;
import com.nexboard.nexboard.repository.ApprovalHistoryRepository;
import com.nexboard.nexboard.repository.ApprovalRequestRepository;
import com.nexboard.nexboard.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class ApprovalWorkflowService {

    private final ApprovalRequestRepository approvalRequestRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final EmployeeRepository employeeRepository;

    public ApprovalWorkflowService(
            ApprovalRequestRepository approvalRequestRepository,
            ApprovalHistoryRepository approvalHistoryRepository,
            EmployeeRepository employeeRepository) {

        this.approvalRequestRepository = approvalRequestRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
        this.employeeRepository = employeeRepository;
    }

    // Create HR, Manager, and IT approval checkpoints for an employee.
    @Transactional
    public List<ApprovalRequestResponseDto> initializeApprovals(
            Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + employeeId));

        Arrays.stream(ApprovalType.values())
                .forEach(approvalType ->
                        createApprovalIfMissing(employee, approvalType));

        return getApprovalsByEmployee(employeeId);
    }

    // Fetch approval checkpoints and their history for one employee.
    public List<ApprovalRequestResponseDto> getApprovalsByEmployee(
            Long employeeId) {

        return approvalRequestRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Approve or reject a checkpoint and record immutable history.
    @Transactional
    public ApprovalRequestResponseDto updateApprovalDecision(
            Long approvalRequestId,
            ApprovalDecisionRequestDto requestDto) {

        ApprovalRequest approvalRequest =
                approvalRequestRepository.findById(approvalRequestId)
                        .orElseThrow(() ->
                                new RuntimeException("Approval request not found"));

        ApprovalStatus previousStatus =
                approvalRequest.getStatus();

        approvalRequest.setStatus(requestDto.getStatus());
        approvalRequest.setRemarks(requestDto.getRemarks());
        approvalRequest.setDecidedAt(LocalDateTime.now());

        ApprovalRequest savedRequest =
                approvalRequestRepository.save(approvalRequest);

        ApprovalHistory history = new ApprovalHistory();
        history.setApprovalRequest(savedRequest);
        history.setFromStatus(previousStatus);
        history.setToStatus(requestDto.getStatus());
        history.setActionBy(requestDto.getActionBy());
        history.setRemarks(requestDto.getRemarks());
        history.setActionAt(LocalDateTime.now());

        approvalHistoryRepository.save(history);

        return mapToResponse(savedRequest);
    }

    // Fetch status transition history for one approval request.
    public List<ApprovalHistoryResponseDto> getApprovalHistory(
            Long approvalRequestId) {

        return approvalHistoryRepository
                .findByApprovalRequestIdOrderByActionAtDesc(
                        approvalRequestId)
                .stream()
                .map(this::mapHistoryToResponse)
                .toList();
    }

    private void createApprovalIfMissing(
            Employee employee,
            ApprovalType approvalType) {

        approvalRequestRepository
                .findByEmployeeIdAndApprovalType(
                        employee.getId(),
                        approvalType)
                .ifPresentOrElse(
                        existingApproval -> {
                        },
                        () -> {
                            ApprovalRequest approvalRequest =
                                    new ApprovalRequest();
                            approvalRequest.setEmployee(employee);
                            approvalRequest.setApprovalType(approvalType);
                            approvalRequest.setStatus(ApprovalStatus.PENDING);
                            approvalRequest.setRemarks("Awaiting approval");
                            approvalRequest.setCreatedAt(LocalDateTime.now());

                            ApprovalRequest savedRequest =
                                    approvalRequestRepository.save(approvalRequest);

                            ApprovalHistory history = new ApprovalHistory();
                            history.setApprovalRequest(savedRequest);
                            history.setFromStatus(null);
                            history.setToStatus(ApprovalStatus.PENDING);
                            history.setActionBy("SYSTEM");
                            history.setRemarks("Approval request created");
                            history.setActionAt(LocalDateTime.now());

                            approvalHistoryRepository.save(history);
                        });
    }

    private ApprovalRequestResponseDto mapToResponse(
            ApprovalRequest approvalRequest) {

        String employeeName =
                approvalRequest.getEmployee().getFirstName()
                        + " "
                        + approvalRequest.getEmployee().getLastName();

        List<ApprovalHistoryResponseDto> history =
                getApprovalHistory(approvalRequest.getId());

        return new ApprovalRequestResponseDto(
                approvalRequest.getId(),
                approvalRequest.getEmployee().getId(),
                employeeName,
                approvalRequest.getApprovalType().name(),
                approvalRequest.getStatus().name(),
                approvalRequest.getRemarks(),
                approvalRequest.getCreatedAt() == null
                        ? null
                        : approvalRequest.getCreatedAt().toString(),
                approvalRequest.getDecidedAt() == null
                        ? null
                        : approvalRequest.getDecidedAt().toString(),
                history
        );
    }

    private ApprovalHistoryResponseDto mapHistoryToResponse(
            ApprovalHistory history) {

        return new ApprovalHistoryResponseDto(
                history.getId(),
                history.getFromStatus() == null
                        ? null
                        : history.getFromStatus().name(),
                history.getToStatus().name(),
                history.getActionBy(),
                history.getRemarks(),
                history.getActionAt().toString()
        );
    }
}
