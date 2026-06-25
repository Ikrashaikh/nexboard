package com.nexboard.nexboard.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Unique audit log id

    // Action performed in system
    private String action;

    // Additional details
    private String description;

    // Time when action occurred
    private String timestamp;
}