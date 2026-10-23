package com.startupinvestment.platform.auth;

import java.util.Map;

public class AuthException extends RuntimeException {

    private final String code;
    private final int status;
    private final Map<String, String> fieldErrors;

    public AuthException(String code, String message, int status) {
        this(code, message, status, Map.of());
    }

    public AuthException(String code, String message, int status, Map<String, String> fieldErrors) {
        super(message);
        this.code = code;
        this.status = status;
        this.fieldErrors = fieldErrors;
    }

    public String code() {
        return code;
    }

    public int status() {
        return status;
    }

    public Map<String, String> fieldErrors() {
        return fieldErrors;
    }
}
