package com.nexboard.nexboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workflow_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private boolean active;

    private LocalDateTime createdAt;

    // Department decides which onboarding path applies to an employee.
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @JsonIgnore
    @OneToMany(
            mappedBy = "workflowTemplate",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @OrderBy("sequenceNumber ASC")
    private List<WorkflowStage> stages = new ArrayList<>();
}
