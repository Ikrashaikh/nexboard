package com.nexboard.nexboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Enhanced error response payload structure.
 * Maintains compatibility with legacy handler.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    // Main error message
    private String message;

    // Error timestamp
    private LocalDateTime timestamp;

    // HTTP status code
    private int status;

    // HTTP status text representation
    private String error;

    // Requested resource path
    private String path;

    // Specific sub-error list (e.g. fields validation failures)
    private List<String> details;

    /**
     * Legacy constructor for backward compatibility.
     */
    public ErrorResponse(String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}