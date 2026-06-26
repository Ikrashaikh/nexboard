package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.DocumentVerificationRequestDto;
import com.nexboard.nexboard.dto.EmployeeDocumentResponseDto;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.entity.EmployeeDocument;
import com.nexboard.nexboard.enums.DocumentType;
import com.nexboard.nexboard.enums.VerificationStatus;
import com.nexboard.nexboard.exception.EmployeeNotFoundException;
import com.nexboard.nexboard.repository.EmployeeDocumentRepository;
import com.nexboard.nexboard.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeDocumentService {

    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeDocumentService(
            EmployeeDocumentRepository employeeDocumentRepository,
            EmployeeRepository employeeRepository) {

        this.employeeDocumentRepository = employeeDocumentRepository;
        this.employeeRepository = employeeRepository;
    }

    // Upload or replace one document type for an employee.
    public EmployeeDocumentResponseDto uploadDocument(
            Long employeeId,
            DocumentType documentType,
            MultipartFile file) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + employeeId));

        if (file.isEmpty()) {
            throw new RuntimeException("Uploaded file cannot be empty");
        }

        EmployeeDocument document = employeeDocumentRepository
                .findByEmployeeIdAndDocumentType(employeeId, documentType)
                .orElseGet(EmployeeDocument::new);

        try {
            document.setEmployee(employee);
            document.setDocumentType(documentType);
            document.setFileName(file.getOriginalFilename());
            document.setContentType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setFileData(file.getBytes());
            document.setVerificationStatus(VerificationStatus.PENDING);
            document.setVerificationRemarks("Document uploaded for verification");
            document.setUploadedAt(LocalDateTime.now());
            document.setVerifiedAt(null);
        } catch (IOException ex) {
            throw new RuntimeException("Unable to read uploaded file");
        }

        return mapToResponse(
                employeeDocumentRepository.save(document));
    }

    // Fetch all uploaded documents for an employee.
    public List<EmployeeDocumentResponseDto> getDocumentsByEmployee(
            Long employeeId) {

        return employeeDocumentRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Fetch document metadata without returning binary file content.
    public EmployeeDocumentResponseDto getDocumentById(Long documentId) {

        EmployeeDocument document =
                employeeDocumentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new RuntimeException("Document not found"));

        return mapToResponse(document);
    }

    // Update verification status after HR/admin review.
    public EmployeeDocumentResponseDto updateVerificationStatus(
            Long documentId,
            DocumentVerificationRequestDto requestDto) {

        EmployeeDocument document =
                employeeDocumentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new RuntimeException("Document not found"));

        document.setVerificationStatus(
                requestDto.getVerificationStatus());
        document.setVerificationRemarks(requestDto.getRemarks());
        document.setVerifiedAt(LocalDateTime.now());

        return mapToResponse(
                employeeDocumentRepository.save(document));
    }

    private EmployeeDocumentResponseDto mapToResponse(
            EmployeeDocument document) {

        String employeeName = document.getEmployee().getFirstName()
                + " "
                + document.getEmployee().getLastName();

        return new EmployeeDocumentResponseDto(
                document.getId(),
                document.getEmployee().getId(),
                employeeName,
                document.getDocumentType().name(),
                document.getFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.getVerificationStatus().name(),
                document.getVerificationRemarks(),
                document.getUploadedAt() == null
                        ? null
                        : document.getUploadedAt().toString(),
                document.getVerifiedAt() == null
                        ? null
                        : document.getVerifiedAt().toString()
        );
    }
}
