package com.nexboard.nexboard.entity;

import com.nexboard.nexboard.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

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

    // Employee assigned to this task
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}