package com.nexboard.nexboard.entity;

import com.nexboard.nexboard.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Unique task id

    private String taskName; // Name of onboarding task

    @Enumerated(EnumType.STRING)
    private TaskStatus status; // Current task status

    // Expected completion date
    private String dueDate;

    // Completion timestamp used for onboarding duration analytics.
    private LocalDateTime completedAt;

    // Employee assigned to this task
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    // Optional source stage when task is generated from a workflow template.
    @ManyToOne
    @JoinColumn(name = "workflow_stage_id")
    private WorkflowStage workflowStage;
}
