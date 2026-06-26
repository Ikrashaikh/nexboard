package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.DocumentVerificationRequestDto;
import com.nexboard.nexboard.dto.EmployeeDocumentResponseDto;
import com.nexboard.nexboard.enums.DocumentType;
import com.nexboard.nexboard.service.EmployeeDocumentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/employee-documents")
public class EmployeeDocumentController {

    private final EmployeeDocumentService employeeDocumentService;

    public EmployeeDocumentController(
            EmployeeDocumentService employeeDocumentService) {
        this.employeeDocumentService = employeeDocumentService;
    }

    // Upload or replace an employee document.
    @PostMapping("/employee/{employeeId}/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public EmployeeDocumentResponseDto uploadDocument(
            @PathVariable Long employeeId,
            @RequestParam DocumentType documentType,
            @RequestParam MultipartFile file) {

        return employeeDocumentService.uploadDocument(
                employeeId,
                documentType,
                file);
    }

    // Fetch all document metadata for one employee.
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<EmployeeDocumentResponseDto> getDocumentsByEmployee(
            @PathVariable Long employeeId) {

        return employeeDocumentService.getDocumentsByEmployee(employeeId);
    }

    // Fetch one document metadata record.
    @GetMapping("/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public EmployeeDocumentResponseDto getDocumentById(
            @PathVariable Long documentId) {

        return employeeDocumentService.getDocumentById(documentId);
    }

    // Verify or reject an uploaded document.
    @PutMapping("/{documentId}/verification")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public EmployeeDocumentResponseDto updateVerificationStatus(
            @PathVariable Long documentId,
            @RequestBody DocumentVerificationRequestDto requestDto) {

        return employeeDocumentService.updateVerificationStatus(
                documentId,
                requestDto);
    }
}
