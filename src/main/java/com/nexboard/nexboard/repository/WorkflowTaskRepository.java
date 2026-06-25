package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.WorkflowTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowTaskRepository
        extends JpaRepository<WorkflowTask, Long> {

    List<WorkflowTask> findByEmployeeId(Long employeeId);

    // Count completed tasks
    long countByEmployeeIdAndStatus(
            Long employeeId,
            com.nexboard.nexboard.enums.TaskStatus status);

    // Count total tasks
    long countByEmployeeId(Long employeeId);
}