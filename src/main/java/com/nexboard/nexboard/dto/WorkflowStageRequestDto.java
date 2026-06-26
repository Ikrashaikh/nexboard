package com.nexboard.nexboard.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkflowStageRequestDto {

    private String stageName;

    private String description;

    private Integer sequenceNumber;

    private Integer dueInDays;
}
