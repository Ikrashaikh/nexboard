package com.nexboard.nexboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workflow_stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stageName;

    private String description;

    private Integer sequenceNumber;

    // Number of days after employee creation when this task is due.
    private Integer dueInDays;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "workflow_template_id")
    private WorkflowTemplate workflowTemplate;
}
