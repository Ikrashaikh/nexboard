package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

}