package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.NotificationResponseDto;
import com.nexboard.nexboard.service.NotificationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Fetch all generated notifications.
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<NotificationResponseDto> getAllNotifications() {

        return notificationService.getAllNotifications();
    }

    // Fetch notifications for one employee.
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<NotificationResponseDto> getNotificationsByEmployee(
            @PathVariable Long employeeId) {

        return notificationService.getNotificationsByEmployee(employeeId);
    }

    // Mark notification as read.
    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public NotificationResponseDto markNotificationAsRead(
            @PathVariable Long notificationId) {

        return notificationService.markNotificationAsRead(notificationId);
    }
}
