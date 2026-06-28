package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * Repository interface for Employee entity, supporting standard CRUD operations
 * and dynamic query specifications for search/filtering.
 */
public interface EmployeeRepository
        extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

}