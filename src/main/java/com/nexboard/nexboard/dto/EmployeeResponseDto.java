package com.nexboard.nexboard.dto;

import com.nexboard.nexboard.enums.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Data Transfer Object for Employee responses.
 * Retains backward compatibility for existing code.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String departmentName;
    private LocalDate joiningDate;
    private EmployeeStatus status;
    private Long managerId;
    private String managerName;

    /**
     * Legacy constructor to maintain backward compatibility with existing calls.
     */
    public EmployeeResponseDto(Long id, String firstName, String lastName, String email, String departmentName) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.departmentName = departmentName;
    }
}