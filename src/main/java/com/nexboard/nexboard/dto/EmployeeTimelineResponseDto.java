package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeTimelineResponseDto {

    private Long employeeId;

    private String employeeName;

    private String departmentName;

    private List<EmployeeTimelineEventResponseDto> timeline;
}
