package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuditReportResponseDto {

    private Long auditId;

    private String action;

    private String description;

    private String timestamp;
}
