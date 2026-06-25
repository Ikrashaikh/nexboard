package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.ArrayList;

@Getter
@Setter
@AllArgsConstructor
public class OverdueTaskResponseDto {

    private Long taskId;

    private String taskName;

    private String employeeName;

    private String dueDate;

    private String status;
}