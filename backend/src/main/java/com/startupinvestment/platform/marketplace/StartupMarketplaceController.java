package com.startupinvestment.platform.marketplace;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.auth.AuthSessionService;
import com.startupinvestment.platform.auth.UserRole;

@RestController
@RequestMapping("/api/v1/startup/marketplace")
public class StartupMarketplaceController {

    private final AuthSessionService sessionService;
    private final MarketplaceService marketplaceService;

    public StartupMarketplaceController(AuthSessionService sessionService, MarketplaceService marketplaceService) {
        this.sessionService = sessionService;
        this.marketplaceService = marketplaceService;
    }

    @GetMapping("/interests")
    public List<InterestResponse> interests(HttpServletRequest request) {
        var startup = sessionService.current(request);
        sessionService.requireRole(request, UserRole.STARTUP);
        return marketplaceService.startupInterests(startup.id());
    }
}
