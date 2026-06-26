package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.ApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalHistoryRepository
        extends JpaRepository<ApprovalHistory, Long> {

    List<ApprovalHistory> findByApprovalRequestIdOrderByActionAtDesc(
            Long approvalRequestId);
}
