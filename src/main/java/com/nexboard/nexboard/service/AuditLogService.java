package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.AuditLogResponseDto;
import com.nexboard.nexboard.entity.AuditLog;
import com.nexboard.nexboard.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // Save audit activity
    public void saveAuditLog(
            String action,
            String description,
            String timestamp) {

        AuditLog auditLog = new AuditLog();

        auditLog.setAction(action);
        auditLog.setDescription(description);
        auditLog.setTimestamp(timestamp);

        auditLogRepository.save(auditLog);
    }

    // Fetch all audit logs
    public List<AuditLogResponseDto> getAllLogs() {

        return auditLogRepository.findAll()
                .stream()
                .map(log ->
                        new AuditLogResponseDto(
                                log.getAction(),
                                log.getDescription(),
                                log.getTimestamp()
                        ))
                .toList();
    }
}