package com.nexboard.nexboard.dto;

import com.nexboard.nexboard.enums.EmployeeStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Data Transfer Object for creating or updating an Employee.
 */
@Getter
@Setter
public class EmployeeRequestDto {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Invalid email format")
    private String email;

    private Long departmentId;

    // Optional date the employee joined the company (defaults to current date if null).
    private LocalDate joiningDate;

    // Optional initial lifecycle status of the employee (defaults to ONBOARDING if null).
    private EmployeeStatus status;

    // Optional manager ID to establish manager-subordinate relationship.
    private Long managerId;
}