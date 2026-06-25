package com.nexboard.nexboard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentRequestDto {
    // Department name should not be empty
    @NotBlank(message = "Department name cannot be empty")
    private String name;
}