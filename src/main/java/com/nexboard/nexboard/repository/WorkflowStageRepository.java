package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.WorkflowStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowStageRepository
        extends JpaRepository<WorkflowStage, Long> {

    List<WorkflowStage> findByWorkflowTemplateIdOrderBySequenceNumberAsc(
            Long workflowTemplateId);
}
