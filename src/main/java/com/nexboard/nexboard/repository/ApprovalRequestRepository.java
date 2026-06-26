package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.ApprovalRequest;
import com.nexboard.nexboard.enums.ApprovalType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApprovalRequestRepository
        extends JpaRepository<ApprovalRequest, Long> {

    List<ApprovalRequest> findByEmployeeId(Long employeeId);

    Optional<ApprovalRequest> findByEmployeeIdAndApprovalType(
            Long employeeId,
            ApprovalType approvalType);
}
