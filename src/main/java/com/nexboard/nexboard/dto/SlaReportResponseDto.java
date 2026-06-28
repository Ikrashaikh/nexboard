package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SlaReportResponseDto {

    private Long taskId;

    private String taskName;

    private String employeeName;

    private String departmentName;

    private String dueDate;

    private String status;

    private boolean slaMissed;

    private long overdueDays;
}
