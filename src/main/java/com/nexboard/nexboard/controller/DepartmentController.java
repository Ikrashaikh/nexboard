package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.DepartmentRequestDto;
import com.nexboard.nexboard.dto.DepartmentResponseDto;
import com.nexboard.nexboard.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    // Create a new department
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public DepartmentResponseDto createDepartment(
            @Valid @RequestBody DepartmentRequestDto requestDto) {

        return departmentService.createDepartment(requestDto);
    }

    // Get all available departments
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<DepartmentResponseDto> getAllDepartments() {

        return departmentService.getAllDepartments();
    }
}
