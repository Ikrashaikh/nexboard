package com.nexboard.nexboard.entity;

import com.nexboard.nexboard.enums.DocumentType;
import com.nexboard.nexboard.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private String fileName;

    private String contentType;

    private Long fileSize;

    @JdbcTypeCode(SqlTypes.VARBINARY)
    private byte[] fileData;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    private String verificationRemarks;

    private LocalDateTime uploadedAt;

    private LocalDateTime verifiedAt;

    // Employee who owns this uploaded document.
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
