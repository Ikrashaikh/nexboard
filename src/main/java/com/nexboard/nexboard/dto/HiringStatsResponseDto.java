package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class HiringStatsResponseDto {

    private long totalHires;

    private long hiresThisWeek;

    private long hiresThisMonth;

    private long hiresThisYear;
}
