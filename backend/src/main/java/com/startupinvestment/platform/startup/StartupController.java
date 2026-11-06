package com.startupinvestment.platform.startup;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.auth.AuthSessionService;
import com.startupinvestment.platform.auth.SessionUser;
import com.startupinvestment.platform.auth.UserRole;

@RestController
@RequestMapping("/api/v1/startup")
public class StartupController {

    private final AuthSessionService sessionService;
    private final StartupService startupService;

    public StartupController(AuthSessionService sessionService, StartupService startupService) {
        this.sessionService = sessionService;
        this.startupService = startupService;
    }

    @GetMapping("/profile")
    public ResponseEntity<StartupProfile> profile(HttpServletRequest request) {
        SessionUser user = startupUser(request);
        return ResponseEntity.of(startupService.findForStartup(user.id()));
    }

    @GetMapping("/capitalization")
    public ResponseEntity<CompanyCapitalization> capitalization(HttpServletRequest request) {
        SessionUser user = startupUser(request);
        return ResponseEntity.of(startupService.findCapitalization(user.id()));
    }

    @PutMapping("/capitalization")
    public CompanyCapitalization saveCapitalization(@RequestBody CompanyCapitalizationRequest capitalization, HttpServletRequest request) {
        return startupService.saveCapitalization(startupUser(request).id(), capitalization);
    }

    @PutMapping("/profile")
    public StartupProfile saveProfile(@RequestBody StartupProfileRequest profile, HttpServletRequest request) {
        return startupService.saveProfile(startupUser(request).id(), profile);
    }

    @PostMapping("/profile/submit")
    public StartupProfile submit(HttpServletRequest request) {
        return startupService.submit(startupUser(request).id());
    }

    @PostMapping("/documents")
    public StartupDocument addDocument(@RequestBody DocumentRequest document, HttpServletRequest request) {
        return startupService.addDocument(startupUser(request).id(), document);
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable long documentId, HttpServletRequest request) {
        startupService.deleteDocument(startupUser(request).id(), documentId);
        return ResponseEntity.noContent().build();
    }

    private SessionUser startupUser(HttpServletRequest request) {
        SessionUser user = sessionService.current(request);
        if (user.role() != UserRole.STARTUP) {
            sessionService.requireRole(request, UserRole.STARTUP);
        }
        return user;
    }
}
