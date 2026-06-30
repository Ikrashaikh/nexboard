package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.DepartmentRequestDto;
import com.nexboard.nexboard.dto.DepartmentResponseDto;
import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.repository.DepartmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private static final Logger log = LoggerFactory.getLogger(DepartmentService.class);

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    // Save department details into database
    public DepartmentResponseDto createDepartment(
            DepartmentRequestDto requestDto) {
        log.info("Creating department: {}", requestDto.getName());

        Department department = new Department();
        department.setName(requestDto.getName());

        Department savedDepartment =
                departmentRepository.save(department);

        log.info("Department created with ID: {}", savedDepartment.getId());
        return new DepartmentResponseDto(
                savedDepartment.getId(),
                savedDepartment.getName()
        );
    }

    // Fetch all departments from database
    public List<DepartmentResponseDto> getAllDepartments() {
        log.debug("Fetching all departments");
        return departmentRepository.findAll()
                .stream()
                .map(department ->
                        new DepartmentResponseDto(
                                department.getId(),
                                department.getName()))
                .toList();
    }
}