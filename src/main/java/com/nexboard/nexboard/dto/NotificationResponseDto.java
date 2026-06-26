package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class NotificationResponseDto {

    private Long id;

    private String type;

    private String title;

    private String message;

    private boolean read;

    private String employeeName;

    private String taskName;

    private String createdAt;
}
