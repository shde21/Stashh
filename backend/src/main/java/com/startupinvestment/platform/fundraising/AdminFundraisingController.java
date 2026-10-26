package com.startupinvestment.platform.fundraising;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.auth.AuthSessionService;
import com.startupinvestment.platform.auth.UserRole;

@RestController
@RequestMapping("/api/v1/admin/fundraising")
public class AdminFundraisingController {

    private final AuthSessionService sessionService;
    private final FundraisingService fundraisingService;

    public AdminFundraisingController(AuthSessionService sessionService, FundraisingService fundraisingService) {
        this.sessionService = sessionService;
        this.fundraisingService = fundraisingService;
    }

    @GetMapping("/pools")
    public List<FundraisingPool> pools(HttpServletRequest request) {
        sessionService.requireRole(request, UserRole.ADMIN);
        return fundraisingService.findAdminPools();
    }

    @PatchMapping("/pools/{poolId}/status")
    public FundraisingPool status(
            @PathVariable long poolId,
            @RequestBody PoolStatusRequest status,
            HttpServletRequest request
    ) {
        sessionService.requireRole(request, UserRole.ADMIN);
        return fundraisingService.setAdminStatus(poolId, parseStatus(status.status()));
    }

    private static PoolStatus parseStatus(String rawStatus) {
        try {
            return PoolStatus.valueOf(rawStatus == null ? "" : rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new com.startupinvestment.platform.auth.AuthException(
                    "INVALID_REQUEST", "Choose open or closed.", 400,
                    java.util.Map.of("status", "Choose open or closed.")
            );
        }
    }
}
