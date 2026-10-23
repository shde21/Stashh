package com.startupinvestment.platform.auth;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiErrorResponse(
        String code,
        String message,
        Map<String, String> fieldErrors
) {
    public static ApiErrorResponse from(AuthException exception) {
        return new ApiErrorResponse(exception.code(), exception.getMessage(), exception.fieldErrors());
    }
}
