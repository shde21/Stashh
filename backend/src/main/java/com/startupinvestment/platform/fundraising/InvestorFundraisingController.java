package com.startupinvestment.platform.fundraising;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.auth.AuthSessionService;
import com.startupinvestment.platform.auth.SessionUser;
import com.startupinvestment.platform.auth.UserRole;
import com.startupinvestment.platform.startup.StartupStage;

@RestController
@RequestMapping("/api/v1/investor/fundraising")
public class InvestorFundraisingController {

    private final AuthSessionService sessionService;
    private final FundraisingService fundraisingService;

    public InvestorFundraisingController(AuthSessionService sessionService, FundraisingService fundraisingService) {
        this.sessionService = sessionService;
        this.fundraisingService = fundraisingService;
    }

    @GetMapping("/pools")
    public List<FundraisingPool> pools(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) String q,
            HttpServletRequest request
    ) {
        SessionUser investor = investorUser(request);
        return fundraisingService.findPublicPools(sector, parseStage(stage), q, investor.id());
    }

    @PostMapping("/pools/{poolId}/commit")
    public InvestorCommitment commit(
            @PathVariable long poolId,
            @RequestBody CommitmentRequest commitment,
            HttpServletRequest request
    ) {
        return fundraisingService.commit(investorUser(request).id(), poolId, commitment);
    }

    @GetMapping("/commitments")
    public List<InvestorCommitment> commitments(HttpServletRequest request) {
        return fundraisingService.commitments(investorUser(request).id());
    }

    @DeleteMapping("/commitments/{commitmentId}")
    public void cancel(@PathVariable long commitmentId, HttpServletRequest request) {
        fundraisingService.cancelCommitment(investorUser(request).id(), commitmentId);
    }

    private SessionUser investorUser(HttpServletRequest request) {
        SessionUser user = sessionService.current(request);
        if (user.role() != UserRole.INVESTOR) sessionService.requireRole(request, UserRole.INVESTOR);
        return user;
    }

    private static StartupStage parseStage(String rawStage) {
        if (rawStage == null || rawStage.isBlank()) return null;
        try {
            return StartupStage.valueOf(rawStage.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new com.startupinvestment.platform.auth.AuthException(
                    "INVALID_REQUEST", "Choose a supported company stage.", 400,
                    java.util.Map.of("stage", "Choose a supported company stage.")
            );
        }
    }
}
