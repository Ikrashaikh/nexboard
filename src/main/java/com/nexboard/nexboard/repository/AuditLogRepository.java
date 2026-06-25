package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {
}