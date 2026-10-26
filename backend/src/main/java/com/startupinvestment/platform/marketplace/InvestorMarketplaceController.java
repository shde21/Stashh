package com.startupinvestment.platform.marketplace;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

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
@RequestMapping("/api/v1/investor/marketplace")
public class InvestorMarketplaceController {

    private final AuthSessionService sessionService;
    private final MarketplaceService marketplaceService;

    public InvestorMarketplaceController(AuthSessionService sessionService, MarketplaceService marketplaceService) {
        this.sessionService = sessionService;
        this.marketplaceService = marketplaceService;
    }

    @GetMapping("/watchlist")
    public List<MarketplaceStartup> watchlist(HttpServletRequest request) {
        return marketplaceService.watchlist(investor(request).id());
    }

    @PutMapping("/watchlist/{profileId}")
    public void save(@PathVariable long profileId, @RequestBody(required = false) java.util.Map<String, String> body, HttpServletRequest request) {
        marketplaceService.save(investor(request).id(), profileId, body == null ? null : body.get("note"));
    }

    @DeleteMapping("/watchlist/{profileId}")
    public void remove(@PathVariable long profileId, HttpServletRequest request) {
        marketplaceService.remove(investor(request).id(), profileId);
    }

    @PostMapping("/startups/{profileId}/interest")
    public InterestResponse interest(@PathVariable long profileId, @RequestBody(required = false) InterestRequest body, HttpServletRequest request) {
        return marketplaceService.expressInterest(investor(request).id(), profileId, body);
    }

    @DeleteMapping("/startups/{profileId}/interest")
    public InterestResponse withdrawInterest(@PathVariable long profileId, HttpServletRequest request) {
        return marketplaceService.withdrawInterest(investor(request).id(), profileId);
    }

    @GetMapping("/interests")
    public List<InterestResponse> interests(HttpServletRequest request) {
        return marketplaceService.investorInterests(investor(request).id());
    }

    private SessionUser investor(HttpServletRequest request) {
        SessionUser user = sessionService.current(request);
        if (user.role() != UserRole.INVESTOR) sessionService.requireRole(request, UserRole.INVESTOR);
        return user;
    }
}
