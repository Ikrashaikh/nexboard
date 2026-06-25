package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeResponseDto {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String departmentName;
}