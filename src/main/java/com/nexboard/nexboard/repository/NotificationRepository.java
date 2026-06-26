package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByEmployeeIdOrderByCreatedAtDesc(
            Long employeeId);

    boolean existsByWorkflowTaskIdAndType(
            Long workflowTaskId,
            com.nexboard.nexboard.enums.NotificationType type);

    boolean existsByEmployeeIdAndType(
            Long employeeId,
            com.nexboard.nexboard.enums.NotificationType type);
}
