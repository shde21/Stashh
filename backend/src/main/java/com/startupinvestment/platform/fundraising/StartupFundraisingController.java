package com.startupinvestment.platform.fundraising;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.auth.AuthSessionService;
import com.startupinvestment.platform.auth.SessionUser;
import com.startupinvestment.platform.auth.UserRole;

@RestController
@RequestMapping("/api/v1/startup/fundraising")
public class StartupFundraisingController {

    private final AuthSessionService sessionService;
    private final FundraisingService fundraisingService;

    public StartupFundraisingController(AuthSessionService sessionService, FundraisingService fundraisingService) {
        this.sessionService = sessionService;
        this.fundraisingService = fundraisingService;
    }

    @GetMapping("/pool")
    public ResponseEntity<FundraisingPool> pool(HttpServletRequest request) {
        return ResponseEntity.of(fundraisingService.findForStartup(startupUser(request).id()));
    }

    @PutMapping("/pool")
    public FundraisingPool save(@RequestBody FundraisingPoolRequest pool, HttpServletRequest request) {
        return fundraisingService.saveForStartup(startupUser(request).id(), pool);
    }

    @PostMapping("/pool/open")
    public FundraisingPool open(HttpServletRequest request) {
        return fundraisingService.setStartupStatus(startupUser(request).id(), PoolStatus.OPEN);
    }

    @PostMapping("/pool/close")
    public FundraisingPool close(HttpServletRequest request) {
        return fundraisingService.setStartupStatus(startupUser(request).id(), PoolStatus.CLOSED);
    }

    private SessionUser startupUser(HttpServletRequest request) {
        SessionUser user = sessionService.current(request);
        if (user.role() != UserRole.STARTUP) sessionService.requireRole(request, UserRole.STARTUP);
        return user;
    }
}
