package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class WorkflowStageResponseDto {

    private Long id;

    private String stageName;

    private String description;

    private Integer sequenceNumber;

    private Integer dueInDays;
}
