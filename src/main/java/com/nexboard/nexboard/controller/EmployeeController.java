package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.EmployeeRequestDto;
import com.nexboard.nexboard.dto.EmployeeResponseDto;
import com.nexboard.nexboard.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(
            EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Create employee
    @PostMapping
    public EmployeeResponseDto createEmployee(
            @Valid @RequestBody EmployeeRequestDto requestDto) {

        return employeeService.createEmployee(requestDto);
    }

    // Get all employees
    @GetMapping
    public List<EmployeeResponseDto> getAllEmployees() {

        return employeeService.getAllEmployees();
    }

    // Get employee by id
    @GetMapping("/{id}")
    public EmployeeResponseDto getEmployeeById(
            @PathVariable Long id) {

        return employeeService.getEmployeeById(id);
    }
}