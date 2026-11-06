package com.startupinvestment.platform.auth;

import java.security.SecureRandom;
import java.util.Base64;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.stereotype.Service;

@Service
public class CsrfService {

    public static final String SESSION_TOKEN_ATTRIBUTE = "stashh.csrf-token";
    public static final String HEADER_NAME = "X-CSRF-Token";

    private final SecureRandom secureRandom = new SecureRandom();

    public String token(HttpServletRequest request) {
        HttpSession session = request.getSession(true);
        Object existing = session.getAttribute(SESSION_TOKEN_ATTRIBUTE);
        if (existing instanceof String token && !token.isBlank()) {
            return token;
        }

        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        session.setAttribute(SESSION_TOKEN_ATTRIBUTE, token);
        return token;
    }

    public boolean isValid(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return false;
        }
        Object expected = session.getAttribute(SESSION_TOKEN_ATTRIBUTE);
        String actual = request.getHeader(HEADER_NAME);
        return expected instanceof String expectedToken
                && actual != null
                && secureEquals(expectedToken, actual);
    }

    private boolean secureEquals(String expected, String actual) {
        byte[] expectedBytes = expected.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] actualBytes = actual.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return java.security.MessageDigest.isEqual(expectedBytes, actualBytes);
    }
}
