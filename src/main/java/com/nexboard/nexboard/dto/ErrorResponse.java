package com.nexboard.nexboard.dto;

public class ErrorResponse {

    // Stores error message to send in API response
    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}