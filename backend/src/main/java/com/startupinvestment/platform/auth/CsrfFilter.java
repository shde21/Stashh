package com.startupinvestment.platform.auth;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import tools.jackson.databind.ObjectMapper;

@Component
@Order(1)
public class CsrfFilter extends OncePerRequestFilter {

    private final CsrfService csrfService;
    private final ObjectMapper objectMapper;

    public CsrfFilter(CsrfService csrfService, ObjectMapper objectMapper) {
        this.csrfService = csrfService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (isProtectedRequest(request) && !csrfService.isValid(request)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(),
                    new ApiErrorResponse("CSRF_INVALID", "A valid CSRF token is required.", java.util.Map.of()));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isProtectedRequest(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        return !"GET".equalsIgnoreCase(method)
                && !"HEAD".equalsIgnoreCase(method)
                && !"OPTIONS".equalsIgnoreCase(method)
                && path.startsWith(request.getContextPath() + "/api/v1/");
    }
}
