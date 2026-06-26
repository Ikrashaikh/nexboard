package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.EmployeeRequestDto;
import com.nexboard.nexboard.dto.EmployeeResponseDto;
import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.exception.EmployeeNotFoundException;
import com.nexboard.nexboard.repository.DepartmentRepository;
import com.nexboard.nexboard.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final WorkflowTemplateService workflowTemplateService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           WorkflowTemplateService workflowTemplateService) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.workflowTemplateService = workflowTemplateService;
    }

    // Create a new employee and assign department
    public EmployeeResponseDto createEmployee(EmployeeRequestDto requestDto) {

        // Fetch department using department id
        Department department = departmentRepository.findById(
                        requestDto.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        Employee employee = new Employee();

        employee.setFirstName(requestDto.getFirstName());
        employee.setLastName(requestDto.getLastName());
        employee.setEmail(requestDto.getEmail());
        employee.setDepartment(department);
        employee.setCreatedAt(LocalDateTime.now());

        Employee savedEmployee = employeeRepository.save(employee);

        // Assign the department onboarding path if one is configured.
        workflowTemplateService.autoAssignWorkflowToEmployee(savedEmployee);

        return new EmployeeResponseDto(
                savedEmployee.getId(),
                savedEmployee.getFirstName(),
                savedEmployee.getLastName(),
                savedEmployee.getEmail(),
                savedEmployee.getDepartment().getName()
        );
    }

    // Fetch all employees
    public List<EmployeeResponseDto> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(employee ->
                        new EmployeeResponseDto(
                                employee.getId(),
                                employee.getFirstName(),
                                employee.getLastName(),
                                employee.getEmail(),
                                employee.getDepartment().getName()
                        ))
                .toList();
    }

    // Fetch employee by id
    public EmployeeResponseDto getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + id));

        return new EmployeeResponseDto(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getDepartment().getName()
        );
    }
}
