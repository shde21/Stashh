package com.startupinvestment.platform.auth;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {

    private final AuthSessionService sessionService;

    public MeController(AuthSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public AuthUserResponse currentUser(HttpServletRequest request) {
        return sessionService.current(request).response();
    }
}
