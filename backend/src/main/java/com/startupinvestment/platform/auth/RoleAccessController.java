package com.startupinvestment.platform.auth;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class RoleAccessController {

    private final AuthSessionService sessionService;

    public RoleAccessController(AuthSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/startup/access")
    public Map<String, String> startupAccess(HttpServletRequest request) {
        sessionService.requireRole(request, UserRole.STARTUP);
        return Map.of("area", "startup", "access", "granted");
    }

    @GetMapping("/investor/access")
    public Map<String, String> investorAccess(HttpServletRequest request) {
        sessionService.requireRole(request, UserRole.INVESTOR);
        return Map.of("area", "investor", "access", "granted");
    }

    @GetMapping("/admin/access")
    public Map<String, String> adminAccess(HttpServletRequest request) {
        sessionService.requireRole(request, UserRole.ADMIN);
        return Map.of("area", "admin", "access", "granted");
    }
}
