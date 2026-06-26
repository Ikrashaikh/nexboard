package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.WorkflowTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkflowTemplateRepository
        extends JpaRepository<WorkflowTemplate, Long> {

    Optional<WorkflowTemplate> findFirstByDepartmentIdAndActiveTrue(
            Long departmentId);

    List<WorkflowTemplate> findByDepartmentId(Long departmentId);
}
