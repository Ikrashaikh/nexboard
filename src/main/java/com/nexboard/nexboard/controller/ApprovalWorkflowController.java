package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.ApprovalDecisionRequestDto;
import com.nexboard.nexboard.dto.ApprovalHistoryResponseDto;
import com.nexboard.nexboard.dto.ApprovalRequestResponseDto;
import com.nexboard.nexboard.service.ApprovalWorkflowService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approval-workflows")
public class ApprovalWorkflowController {

    private final ApprovalWorkflowService approvalWorkflowService;

    public ApprovalWorkflowController(
            ApprovalWorkflowService approvalWorkflowService) {
        this.approvalWorkflowService = approvalWorkflowService;
    }

    // Create HR, Manager, and IT approval checkpoints for an employee.
    @PostMapping("/employee/{employeeId}/initialize")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<ApprovalRequestResponseDto> initializeApprovals(
            @PathVariable Long employeeId) {

        return approvalWorkflowService.initializeApprovals(employeeId);
    }

    // Fetch approvals for one employee.
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<ApprovalRequestResponseDto> getApprovalsByEmployee(
            @PathVariable Long employeeId) {

        return approvalWorkflowService.getApprovalsByEmployee(employeeId);
    }

    // Approve or reject an approval checkpoint.
    @PutMapping("/{approvalRequestId}/decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ApprovalRequestResponseDto updateApprovalDecision(
            @PathVariable Long approvalRequestId,
            @RequestBody ApprovalDecisionRequestDto requestDto) {

        return approvalWorkflowService.updateApprovalDecision(
                approvalRequestId,
                requestDto);
    }

    // Fetch immutable decision history for one approval request.
    @GetMapping("/{approvalRequestId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<ApprovalHistoryResponseDto> getApprovalHistory(
            @PathVariable Long approvalRequestId) {

        return approvalWorkflowService.getApprovalHistory(
                approvalRequestId);
    }
}
