package com.nexboard.nexboard.dto;

import com.nexboard.nexboard.enums.TaskStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTaskStatusDto {

    // New status for onboarding task
    private TaskStatus status;
}