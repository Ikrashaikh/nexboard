package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeDocumentResponseDto {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private String documentType;

    private String fileName;

    private String contentType;

    private Long fileSize;

    private String verificationStatus;

    private String verificationRemarks;

    private String uploadedAt;

    private String verifiedAt;
}
