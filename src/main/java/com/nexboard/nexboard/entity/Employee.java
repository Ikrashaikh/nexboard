package com.nexboard.nexboard.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nexboard.nexboard.enums.EmployeeStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email; 

    // Employee creation date used for hiring and onboarding analytics.
    private LocalDateTime createdAt;

    // Many employees can belong to one department
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // Date the employee officially joined the company.
    private LocalDate joiningDate;

    // Current employment status.
    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;

    // Self-referential relationship mapping an employee to their manager.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    // Self-referential relationship mapping a manager to their direct reports.
    @JsonIgnore
    @OneToMany(mappedBy = "manager")
    private List<Employee> subordinates;

    // One employee can have multiple onboarding tasks
    @JsonIgnore
    @OneToMany(mappedBy = "employee")
    private List<WorkflowTask> workflowTasks;

    // Documents uploaded by the employee during onboarding.
    @JsonIgnore
    @OneToMany(mappedBy = "employee")
    private List<EmployeeDocument> employeeDocuments;

    // Approval checkpoints created for this employee.
    @JsonIgnore
    @OneToMany(mappedBy = "employee")
    private List<ApprovalRequest> approvalRequests;
}
