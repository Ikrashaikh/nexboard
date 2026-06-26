package com.nexboard.nexboard.entity;

import com.nexboard.nexboard.enums.EscalationStatus;
import com.nexboard.nexboard.enums.EscalationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "escalations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Escalation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private EscalationType type;

    @Enumerated(EnumType.STRING)
    private EscalationStatus status;

    private String message;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "workflow_task_id")
    private WorkflowTask workflowTask;
}
