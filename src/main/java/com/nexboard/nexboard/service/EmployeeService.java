package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.EmployeeRequestDto;
import com.nexboard.nexboard.dto.EmployeeResponseDto;
import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.enums.EmployeeStatus;
import com.nexboard.nexboard.exception.EmployeeNotFoundException;
import com.nexboard.nexboard.repository.DepartmentRepository;
import com.nexboard.nexboard.repository.EmployeeRepository;
import com.nexboard.nexboard.repository.EmployeeSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class handling business operations related to employees.
 */
@Service
public class EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final WorkflowTemplateService workflowTemplateService;
    private final NotificationService notificationService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           WorkflowTemplateService workflowTemplateService,
                           NotificationService notificationService) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.workflowTemplateService = workflowTemplateService;
        this.notificationService = notificationService;
    }

    /**
     * Create a new employee, assigning department, default joining date/status, and manager.
     */
    public EmployeeResponseDto createEmployee(EmployeeRequestDto requestDto) {
        log.info("Creating employee: {} {}", requestDto.getFirstName(), requestDto.getLastName());

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

        // Default joiningDate to today if not provided
        if (requestDto.getJoiningDate() != null) {
            employee.setJoiningDate(requestDto.getJoiningDate());
        } else {
            employee.setJoiningDate(LocalDate.now());
        }

        // Default status to ONBOARDING if not provided
        if (requestDto.getStatus() != null) {
            employee.setStatus(requestDto.getStatus());
        } else {
            employee.setStatus(EmployeeStatus.ONBOARDING);
        }

        // Fetch and set manager if managerId is provided
        if (requestDto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(requestDto.getManagerId())
                    .orElseThrow(() -> new EmployeeNotFoundException(
                            "Manager not found with ID: " + requestDto.getManagerId()));
            employee.setManager(manager);
        }

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Employee created with ID: {}", savedEmployee.getId());

        notificationService.sendWelcomeEmployeeNotification(savedEmployee);

        // Assign the department onboarding path if one is configured.
        workflowTemplateService.autoAssignWorkflowToEmployee(savedEmployee);

        return convertToDto(savedEmployee);
    }

    /**
     * Fetch all employees in the system.
     */
    public List<EmployeeResponseDto> getAllEmployees() {
        log.debug("Fetching all employees");
        return employeeRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    /**
     * Fetch employee by ID.
     */
    public EmployeeResponseDto getEmployeeById(Long id) {
        log.debug("Fetching employee with ID: {}", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + id));

        return convertToDto(employee);
    }

    /**
     * Dynamic search and filter employees with pagination and sorting.
     */
    public Page<EmployeeResponseDto> searchEmployees(String name,
                                                     String department,
                                                     LocalDate joiningDate,
                                                     EmployeeStatus status,
                                                     String managerName,
                                                     Long managerId,
                                                     Pageable pageable) {
        log.debug("Searching employees with filters - name: {}, department: {}, status: {}", name, department, status);
        Specification<Employee> spec = null;

        if (name != null && !name.trim().isEmpty()) {
            spec = (spec == null) ? EmployeeSpecification.hasName(name) : spec.and(EmployeeSpecification.hasName(name));
        }
        if (department != null && !department.trim().isEmpty()) {
            spec = (spec == null) ? EmployeeSpecification.hasDepartment(department) : spec.and(EmployeeSpecification.hasDepartment(department));
        }
        if (joiningDate != null) {
            spec = (spec == null) ? EmployeeSpecification.hasJoiningDate(joiningDate) : spec.and(EmployeeSpecification.hasJoiningDate(joiningDate));
        }
        if (status != null) {
            spec = (spec == null) ? EmployeeSpecification.hasStatus(status) : spec.and(EmployeeSpecification.hasStatus(status));
        }
        if (managerName != null || managerId != null) {
            spec = (spec == null) ? EmployeeSpecification.hasManager(managerName, managerId) : spec.and(EmployeeSpecification.hasManager(managerName, managerId));
        }

        if (spec == null) {
            return employeeRepository.findAll(pageable).map(this::convertToDto);
        } else {
            return employeeRepository.findAll(spec, pageable).map(this::convertToDto);
        }
    }

    /**
     * Helper to map Employee entity to EmployeeResponseDto.
     */
    private EmployeeResponseDto convertToDto(Employee employee) {
        String managerFullName = null;
        Long managerId = null;

        if (employee.getManager() != null) {
            managerId = employee.getManager().getId();
            managerFullName = employee.getManager().getFirstName() + " " + employee.getManager().getLastName();
        }

        String deptName = employee.getDepartment() != null ? employee.getDepartment().getName() : null;

        return new EmployeeResponseDto(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                deptName,
                employee.getJoiningDate(),
                employee.getStatus(),
                managerId,
                managerFullName
        );
    }
}
