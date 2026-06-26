package com.nexboard.nexboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nexboard.nexboard.enums.ApprovalStatus;
import com.nexboard.nexboard.enums.ApprovalType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "approval_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ApprovalType approvalType;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus status;

    private String remarks;

    private LocalDateTime createdAt;

    private LocalDateTime decidedAt;

    // Employee whose onboarding approval is being tracked.
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @JsonIgnore
    @OneToMany(
            mappedBy = "approvalRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<ApprovalHistory> approvalHistories = new ArrayList<>();
}
