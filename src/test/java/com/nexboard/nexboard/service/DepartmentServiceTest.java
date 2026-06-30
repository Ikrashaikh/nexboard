package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.DepartmentRequestDto;
import com.nexboard.nexboard.dto.DepartmentResponseDto;
import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.repository.DepartmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private DepartmentService departmentService;

    private Department department;

    @BeforeEach
    void setUp() {
        department = new Department();
        department.setId(1L);
        department.setName("Engineering");
    }

    @Test
    void createDepartment_shouldSaveAndReturnDto() {
        DepartmentRequestDto requestDto = new DepartmentRequestDto();
        requestDto.setName("Engineering");

        when(departmentRepository.save(any(Department.class))).thenReturn(department);

        DepartmentResponseDto result = departmentService.createDepartment(requestDto);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Engineering");
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void getAllDepartments_shouldReturnAllDepartments() {
        Department dept2 = new Department();
        dept2.setId(2L);
        dept2.setName("Human Resources");

        when(departmentRepository.findAll()).thenReturn(List.of(department, dept2));

        List<DepartmentResponseDto> result = departmentService.getAllDepartments();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Engineering");
        assertThat(result.get(1).getName()).isEqualTo("Human Resources");
        verify(departmentRepository, times(1)).findAll();
    }

    @Test
    void getAllDepartments_shouldReturnEmptyList_whenNoDepartmentsExist() {
        when(departmentRepository.findAll()).thenReturn(List.of());

        List<DepartmentResponseDto> result = departmentService.getAllDepartments();

        assertThat(result).isEmpty();
    }
}
