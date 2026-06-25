package com.nexboard.nexboard.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
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

    // Many employees can belong to one department
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // One employee can have multiple onboarding tasks
    @JsonIgnore
    @OneToMany(mappedBy = "employee")
    private List<WorkflowTask> workflowTasks;
}