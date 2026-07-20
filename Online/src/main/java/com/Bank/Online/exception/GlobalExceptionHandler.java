package com.Bank.Online.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(InsufficientBalanceException.class)
    public ResponseEntity<?> handle(InsufficientBalanceException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", "Insufficient balance", "available", ex.getBalance()));
    }
        // handle RecipientNotFoundException, validation errors, etc.
        @ExceptionHandler(RecipientNotFoundException.class)
        public ResponseEntity<?> handleRecipientNotFound(RecipientNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<?> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
    }
    @ExceptionHandler(UserIdAlreadyExistsException.class)
    public ResponseEntity<?> handleUserIdAlreadyExists(UserIdAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }
}

