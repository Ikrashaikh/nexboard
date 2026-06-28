package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.EmployeeRequestDto;
import com.nexboard.nexboard.dto.EmployeeResponseDto;
import com.nexboard.nexboard.enums.EmployeeStatus;
import com.nexboard.nexboard.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller exposing Employee REST endpoints.
 */
@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(
            EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * Create employee
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public EmployeeResponseDto createEmployee(
            @Valid @RequestBody EmployeeRequestDto requestDto) {

        return employeeService.createEmployee(requestDto);
    }

    /**
     * Get all employees (legacy API, not paginated)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<EmployeeResponseDto> getAllEmployees() {

        return employeeService.getAllEmployees();
    }

    /**
     * Get employee by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public EmployeeResponseDto getEmployeeById(
            @PathVariable Long id) {

        return employeeService.getEmployeeById(id);
    }

    /**
     * Dynamic Search and Filter employees, supporting pagination and sorting.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public Page<EmployeeResponseDto> searchEmployees(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) LocalDate joiningDate,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) String managerName,
            @RequestParam(required = false) Long managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return employeeService.searchEmployees(
                name, department, joiningDate, status, managerName, managerId, pageable);
    }
}
