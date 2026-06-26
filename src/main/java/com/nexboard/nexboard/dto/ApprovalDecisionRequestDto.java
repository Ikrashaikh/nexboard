package com.nexboard.nexboard.dto;

import com.nexboard.nexboard.enums.ApprovalStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprovalDecisionRequestDto {

    private ApprovalStatus status;

    private String actionBy;

    private String remarks;
}
