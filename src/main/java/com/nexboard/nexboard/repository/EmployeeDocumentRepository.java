package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.EmployeeDocument;
import com.nexboard.nexboard.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeDocumentRepository
        extends JpaRepository<EmployeeDocument, Long> {

    List<EmployeeDocument> findByEmployeeId(Long employeeId);

    Optional<EmployeeDocument> findByEmployeeIdAndDocumentType(
            Long employeeId,
            DocumentType documentType);
}
