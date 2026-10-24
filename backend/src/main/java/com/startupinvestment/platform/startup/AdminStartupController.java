package com.startupinvestment.platform.startup;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.auth.AuthSessionService;
import com.startupinvestment.platform.auth.SessionUser;
import com.startupinvestment.platform.auth.UserRole;

@RestController
@RequestMapping("/api/v1/admin/startups")
public class AdminStartupController {

    private final AuthSessionService sessionService;
    private final StartupService startupService;

    public AdminStartupController(AuthSessionService sessionService, StartupService startupService) {
        this.sessionService = sessionService;
        this.startupService = startupService;
    }

    @GetMapping
    public List<StartupProfile> reviewQueue(HttpServletRequest request) {
        requireAdmin(request);
        return startupService.reviewQueue();
    }

    @PatchMapping("/{profileId}/review")
    public StartupProfile review(
            @PathVariable long profileId,
            @RequestBody ReviewRequest review,
            HttpServletRequest request
    ) {
        SessionUser admin = requireAdmin(request);
        return startupService.review(admin.id(), profileId, review);
    }

    @PatchMapping("/{profileId}/visibility")
    public StartupProfile visibility(
            @PathVariable long profileId,
            @RequestBody VisibilityRequest visibility,
            HttpServletRequest request
    ) {
        SessionUser admin = requireAdmin(request);
        return startupService.updateVisibility(admin.id(), profileId, visibility);
    }

    private SessionUser requireAdmin(HttpServletRequest request) {
        SessionUser user = sessionService.current(request);
        if (user.role() != UserRole.ADMIN) {
            sessionService.requireRole(request, UserRole.ADMIN);
        }
        return user;
    }
}
