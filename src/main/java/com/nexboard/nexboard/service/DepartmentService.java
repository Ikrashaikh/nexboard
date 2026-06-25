package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.DepartmentRequestDto;
import com.nexboard.nexboard.dto.DepartmentResponseDto;
import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    // Save department details into database
    public DepartmentResponseDto createDepartment(
            DepartmentRequestDto requestDto) {

        Department department = new Department();
        department.setName(requestDto.getName());

        Department savedDepartment =
                departmentRepository.save(department);

        return new DepartmentResponseDto(
                savedDepartment.getId(),
                savedDepartment.getName()
        );
    }

    // Fetch all departments from database
    public List<DepartmentResponseDto> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(department ->
                        new DepartmentResponseDto(
                                department.getId(),
                                department.getName()))
                .toList();
    }
}