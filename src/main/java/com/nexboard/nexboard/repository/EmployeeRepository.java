package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long> {

}