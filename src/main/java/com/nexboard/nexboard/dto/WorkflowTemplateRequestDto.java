package com.nexboard.nexboard.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkflowTemplateRequestDto {

    private String name;

    private String description;

    private Long departmentId;

    private boolean active;
}
