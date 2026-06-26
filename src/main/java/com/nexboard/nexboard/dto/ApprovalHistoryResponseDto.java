package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ApprovalHistoryResponseDto {

    private Long id;

    private String fromStatus;

    private String toStatus;

    private String actionBy;

    private String remarks;

    private String actionAt;
}
