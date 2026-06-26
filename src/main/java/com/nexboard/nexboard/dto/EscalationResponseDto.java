package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EscalationResponseDto {

    private Long id;

    private String type;

    private String status;

    private String message;

    private String employeeName;

    private String taskName;

    private String createdAt;
}
