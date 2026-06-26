package com.nexboard.nexboard.entity;

import com.nexboard.nexboard.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus toStatus;

    private String actionBy;

    private String remarks;

    private LocalDateTime actionAt;

    // Parent approval request for this status transition.
    @ManyToOne
    @JoinColumn(name = "approval_request_id")
    private ApprovalRequest approvalRequest;
}
