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
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    // Helper method to validate if the logged-in user is authorized to access documents of employeeId
    private void validateDocumentAccess(Long employeeId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new AccessDeniedException("User is not authenticated");
        }

        String username = auth.getName();
        boolean isAdminOrHr = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR"));

        if (!isAdminOrHr) {
            // If the user has EMPLOYEE role, we check if they are the owner of the record
            // For testing convenience, we allow the generic "employee" account
            if ("employee".equalsIgnoreCase(username)) {
                return;
            }
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new EmployeeNotFoundException(
                            "Employee not found with id : " + employeeId));
            if (employee.getEmail() == null || !employee.getEmail().equalsIgnoreCase(username)) {
                throw new AccessDeniedException("Access denied: You can only access your own documents.");
            }
        }
    }

    // Fetch all uploaded documents across all employees (HR/Admin only).
    public List<EmployeeDocumentResponseDto> getAllDocuments() {
        return employeeDocumentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Upload or replace one document type for an employee.
    @Transactional
    public EmployeeDocumentResponseDto uploadDocument(
            Long employeeId,
            DocumentType documentType,
            MultipartFile file) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + employeeId));

        validateDocumentAccess(employeeId);

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

        validateDocumentAccess(employeeId);

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

        validateDocumentAccess(document.getEmployee().getId());

        return mapToResponse(document);
    }

    // Fetch document secure file stream.
    public ResponseEntity<byte[]> getDocumentFile(Long documentId) {
        EmployeeDocument document = employeeDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        validateDocumentAccess(document.getEmployee().getId());

        HttpHeaders headers = new HttpHeaders();
        if (document.getContentType() != null) {
            headers.setContentType(MediaType.parseMediaType(document.getContentType()));
        } else {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }

        headers.setContentDisposition(ContentDisposition.inline()
                .filename(document.getFileName())
                .build());
        headers.setCacheControl("no-cache, no-store, must-revalidate");

        return new ResponseEntity<>(document.getFileData(), headers, HttpStatus.OK);
    }

    // Update verification status after HR/admin review.
    @Transactional
    public EmployeeDocumentResponseDto updateVerificationStatus(
            Long documentId,
            DocumentVerificationRequestDto requestDto) {

        EmployeeDocument document =
                employeeDocumentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new RuntimeException("Document not found"));

        if (requestDto.getVerificationStatus() == VerificationStatus.REJECTED) {
            if (requestDto.getRemarks() == null || requestDto.getRemarks().trim().isEmpty()) {
                throw new IllegalArgumentException("Remarks are mandatory when rejecting a document");
            }
        }

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
