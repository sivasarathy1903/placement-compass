package com.placementcompass.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorMessage> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorMessage message = new ErrorMessage(
                HttpStatus.NOT_FOUND.value(),
                Instant.now(),
                ex.getMessage(),
                request.getDescription(false));

        return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TokenRefreshException.class)
    public ResponseEntity<ErrorMessage> handleTokenRefreshException(TokenRefreshException ex, WebRequest request) {
        ErrorMessage message = new ErrorMessage(
                HttpStatus.FORBIDDEN.value(),
                Instant.now(),
                ex.getMessage(),
                request.getDescription(false));
        
        return new ResponseEntity<>(message, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorMessage> handleMaxUploadSizeExceededException(
            MaxUploadSizeExceededException ex, WebRequest request) {
        ErrorMessage message = new ErrorMessage(
                HttpStatus.PAYLOAD_TOO_LARGE.value(),
                Instant.now(),
                "File size exceeds the 10 MB limit. Please upload a smaller file.",
                request.getDescription(false));
        return new ResponseEntity<>(message, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    /**
     * Handles Spring Security filter-layer authorization failures (AccessDeniedException).
     *
     * This fires when Spring Security's filter chain rejects a request before it reaches
     * a controller — for example, URL-level rules in SecurityConfig (.hasRole(...)).
     * Note: AuthorizationDeniedException (method-level @PreAuthorize) is handled separately
     * in handleAuthorizationDeniedException() below.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorMessage> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        ErrorMessage message = new ErrorMessage(
                HttpStatus.FORBIDDEN.value(),
                Instant.now(),
                "Access Denied: You do not have permission to perform this action.",
                request.getDescription(false));
        return new ResponseEntity<>(message, HttpStatus.FORBIDDEN);
    }

    /**
     * Handles Spring Security 6.x method-security authorization failures.
     *
     * In Spring Boot 3 / Spring Security 6, @PreAuthorize failures throw
     * AuthorizationDeniedException (a RuntimeException), NOT AccessDeniedException,
     * when processed through AOP method interceptors. Without this handler,
     * the exception propagates to handleGlobalException() and returns HTTP 500.
     *
     * CRITICAL: This handler MUST be declared before handleGlobalException().
     * AuthorizationDeniedException extends AccessDeniedException which extends RuntimeException,
     * so the most specific handler wins — but only if declared explicitly.
     */
    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ErrorMessage> handleAuthorizationDeniedException(
            AuthorizationDeniedException ex, WebRequest request) {
        ErrorMessage message = new ErrorMessage(
                HttpStatus.FORBIDDEN.value(),
                Instant.now(),
                "Access Denied: You do not have permission to perform this action.",
                request.getDescription(false));
        return new ResponseEntity<>(message, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorMessage> handleGlobalException(Exception ex, WebRequest request) {
        ex.printStackTrace();
        ErrorMessage message = new ErrorMessage(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                Instant.now(),
                ex.getMessage(),
                request.getDescription(false));
        
        return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
