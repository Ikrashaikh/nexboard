package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class WorkflowTemplateResponseDto {

    private Long id;

    private String name;

    private String description;

    private String departmentName;

    private boolean active;

    private List<WorkflowStageResponseDto> stages;
}
