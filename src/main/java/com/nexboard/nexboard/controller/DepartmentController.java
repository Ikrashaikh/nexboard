package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.DepartmentRequestDto;
import com.nexboard.nexboard.dto.DepartmentResponseDto;
import com.nexboard.nexboard.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@Tag(name = "Departments", description = "Manage organizational departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @Operation(summary = "Create a new department")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public DepartmentResponseDto createDepartment(
            @Valid @RequestBody DepartmentRequestDto requestDto) {
        return departmentService.createDepartment(requestDto);
    }

    @Operation(summary = "Get all departments")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<DepartmentResponseDto> getAllDepartments() {
        return departmentService.getAllDepartments();
    }
}
