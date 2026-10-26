package com.startupinvestment.platform.portfolio;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.auth.AuthSessionService;
import com.startupinvestment.platform.auth.UserRole;

@RestController
@RequestMapping("/api/v1/investor/portfolio")
public class InvestorPortfolioController {

    private final AuthSessionService sessionService;
    private final PortfolioService portfolioService;

    public InvestorPortfolioController(AuthSessionService sessionService, PortfolioService portfolioService) {
        this.sessionService = sessionService;
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public PortfolioSummary portfolio(HttpServletRequest request) {
        var user = sessionService.current(request);
        sessionService.requireRole(request, UserRole.INVESTOR);
        return portfolioService.investorPortfolio(user.id());
    }
}
