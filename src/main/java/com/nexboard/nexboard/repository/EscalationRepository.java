package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.Escalation;
import com.nexboard.nexboard.enums.EscalationStatus;
import com.nexboard.nexboard.enums.EscalationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EscalationRepository
        extends JpaRepository<Escalation, Long> {

    boolean existsByWorkflowTaskIdAndTypeAndStatus(
            Long workflowTaskId,
            EscalationType type,
            EscalationStatus status);

    List<Escalation> findByStatus(EscalationStatus status);
}
