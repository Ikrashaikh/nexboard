package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class BottleneckResponseDto {

    // Task stage causing maximum delay
    private String taskName;

    // Number of pending occurrences
    private long pendingCount;
}