package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.AuditLogResponseDto;
import com.nexboard.nexboard.service.AuditLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(
            AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // Get all audit logs
    @GetMapping
    public List<AuditLogResponseDto> getAllLogs() {

        return auditLogService.getAllLogs();
    }
}