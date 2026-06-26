package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ApprovalRequestResponseDto {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private String approvalType;

    private String status;

    private String remarks;

    private String createdAt;

    private String decidedAt;

    private List<ApprovalHistoryResponseDto> approvalHistory;
}
