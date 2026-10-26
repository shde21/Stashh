package com.startupinvestment.platform.portfolio;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.auth.AuthSessionService;
import com.startupinvestment.platform.auth.UserRole;

@RestController
@RequestMapping("/api/v1/admin/valuations")
public class AdminPortfolioController {

    private final AuthSessionService sessionService;
    private final PortfolioService portfolioService;

    public AdminPortfolioController(AuthSessionService sessionService, PortfolioService portfolioService) {
        this.sessionService = sessionService;
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public List<ValuationSnapshot> snapshots(HttpServletRequest request) {
        sessionService.requireRole(request, UserRole.ADMIN);
        return portfolioService.snapshots();
    }

    @PostMapping
    public ValuationSnapshot create(
            @RequestBody ValuationSnapshotRequest snapshot,
            HttpServletRequest request
    ) {
        var admin = sessionService.current(request);
        sessionService.requireRole(request, UserRole.ADMIN);
        return portfolioService.createSnapshot(admin.id(), snapshot);
    }
}
