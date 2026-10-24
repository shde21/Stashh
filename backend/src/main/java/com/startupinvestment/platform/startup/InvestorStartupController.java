package com.startupinvestment.platform.startup;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.auth.AuthSessionService;
import com.startupinvestment.platform.auth.UserRole;

@RestController
@RequestMapping("/api/v1/investor/startups")
public class InvestorStartupController {

    private final AuthSessionService sessionService;
    private final StartupService startupService;

    public InvestorStartupController(AuthSessionService sessionService, StartupService startupService) {
        this.sessionService = sessionService;
        this.startupService = startupService;
    }

    @GetMapping
    public List<StartupProfile> publicStartups(HttpServletRequest request) {
        sessionService.requireRole(request, UserRole.INVESTOR);
        return startupService.publicProfiles();
    }
}
