package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.EmployeeRequestDto;
import com.nexboard.nexboard.dto.EmployeeResponseDto;
import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.enums.EmployeeStatus;
import com.nexboard.nexboard.exception.EmployeeNotFoundException;
import com.nexboard.nexboard.repository.DepartmentRepository;
import com.nexboard.nexboard.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private WorkflowTemplateService workflowTemplateService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private EmployeeService employeeService;

    private Department department;
    private Employee employee;

    @BeforeEach
    void setUp() {
        department = new Department();
        department.setId(1L);
        department.setName("Engineering");

        employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setEmail("john.doe@example.com");
        employee.setDepartment(department);
        employee.setJoiningDate(LocalDate.now());
        employee.setStatus(EmployeeStatus.ONBOARDING);
        employee.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void createEmployee_shouldCreateAndReturnDto() {
        EmployeeRequestDto requestDto = new EmployeeRequestDto();
        requestDto.setFirstName("John");
        requestDto.setLastName("Doe");
        requestDto.setEmail("john.doe@example.com");
        requestDto.setDepartmentId(1L);

        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);
        doNothing().when(notificationService).sendWelcomeEmployeeNotification(any(Employee.class));
        doNothing().when(workflowTemplateService).autoAssignWorkflowToEmployee(any(Employee.class));

        EmployeeResponseDto result = employeeService.createEmployee(requestDto);

        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
        assertThat(result.getDepartmentName()).isEqualTo("Engineering");
        assertThat(result.getStatus()).isEqualTo(EmployeeStatus.ONBOARDING);

        verify(employeeRepository, times(1)).save(any(Employee.class));
        verify(notificationService, times(1)).sendWelcomeEmployeeNotification(any(Employee.class));
        verify(workflowTemplateService, times(1)).autoAssignWorkflowToEmployee(any(Employee.class));
    }

    @Test
    void createEmployee_shouldThrowException_whenDepartmentNotFound() {
        EmployeeRequestDto requestDto = new EmployeeRequestDto();
        requestDto.setFirstName("John");
        requestDto.setLastName("Doe");
        requestDto.setDepartmentId(99L);

        when(departmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.createEmployee(requestDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Department not found");

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void createEmployee_shouldDefaultStatusToOnboarding_whenStatusNotProvided() {
        EmployeeRequestDto requestDto = new EmployeeRequestDto();
        requestDto.setFirstName("Jane");
        requestDto.setLastName("Smith");
        requestDto.setDepartmentId(1L);
        // status not set

        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(inv -> {
            Employee e = inv.getArgument(0);
            e.setId(2L);
            return e;
        });
        doNothing().when(notificationService).sendWelcomeEmployeeNotification(any());
        doNothing().when(workflowTemplateService).autoAssignWorkflowToEmployee(any());

        EmployeeResponseDto result = employeeService.createEmployee(requestDto);

        assertThat(result.getStatus()).isEqualTo(EmployeeStatus.ONBOARDING);
    }

    @Test
    void getAllEmployees_shouldReturnAllEmployees() {
        Employee emp2 = new Employee();
        emp2.setId(2L);
        emp2.setFirstName("Jane");
        emp2.setLastName("Smith");
        emp2.setDepartment(department);
        emp2.setStatus(EmployeeStatus.ACTIVE);

        when(employeeRepository.findAll()).thenReturn(List.of(employee, emp2));

        List<EmployeeResponseDto> result = employeeService.getAllEmployees();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getFirstName()).isEqualTo("John");
        assertThat(result.get(1).getFirstName()).isEqualTo("Jane");
    }

    @Test
    void getEmployeeById_shouldReturnEmployee_whenFound() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        EmployeeResponseDto result = employeeService.getEmployeeById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getFirstName()).isEqualTo("John");
    }

    @Test
    void getEmployeeById_shouldThrowException_whenNotFound() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getEmployeeById(99L))
                .isInstanceOf(EmployeeNotFoundException.class)
                .hasMessageContaining("Employee not found with id : 99");
    }
}
