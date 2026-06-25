package com.nexboard.nexboard.exception;

// Custom exception when employee is not found
public class EmployeeNotFoundException extends RuntimeException {

    public EmployeeNotFoundException(String message) {
        super(message);
    }
}