package com.startupinvestment.platform.auth;

import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthException(AuthException exception) {
        return ResponseEntity.status(exception.status()).body(ApiErrorResponse.from(exception));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleMalformedJson() {
        return ResponseEntity.badRequest().body(new ApiErrorResponse(
                "INVALID_REQUEST",
                "Request body must be valid JSON.",
                Map.of()
        ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation() {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiErrorResponse(
                "CONFLICT",
                "The request conflicts with existing data.",
                Map.of()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiErrorResponse(
                "INTERNAL_ERROR",
                "Something went wrong while processing the request.",
                Map.of()
        ));
    }
}
