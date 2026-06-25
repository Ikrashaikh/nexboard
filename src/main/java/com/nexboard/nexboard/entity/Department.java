package com.nexboard.nexboard.entity;
import jakarta.persistence.OneToMany;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // One department can have multiple employees
    @OneToMany(mappedBy = "department")
    private List<Employee> employees;



}