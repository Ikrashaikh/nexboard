package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeTimelineEventResponseDto {

    private String eventName;

    private String eventType;

    private String status;

    private String description;

    private String occurredAt;
}
