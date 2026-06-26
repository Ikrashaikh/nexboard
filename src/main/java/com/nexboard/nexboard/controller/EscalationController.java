package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.EscalationResponseDto;
import com.nexboard.nexboard.service.EscalationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/escalations")
public class EscalationController {

    private final EscalationService escalationService;

    public EscalationController(EscalationService escalationService) {
        this.escalationService = escalationService;
    }

    // Run escalation scan for overdue onboarding, approvals, and SLA misses.
    @PostMapping("/run")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<EscalationResponseDto> generateEscalations() {

        return escalationService.generateEscalations();
    }

    // Fetch all escalation records.
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<EscalationResponseDto> getAllEscalations() {

        return escalationService.getAllEscalations();
    }

    // Fetch only open escalation records.
    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<EscalationResponseDto> getOpenEscalations() {

        return escalationService.getOpenEscalations();
    }

    // Mark an escalation as resolved.
    @PutMapping("/{escalationId}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public EscalationResponseDto resolveEscalation(
            @PathVariable Long escalationId) {

        return escalationService.resolveEscalation(escalationId);
    }
}
