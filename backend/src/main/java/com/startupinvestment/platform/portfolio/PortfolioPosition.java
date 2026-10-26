package com.startupinvestment.platform.portfolio;

import java.math.BigDecimal;
import java.time.Instant;

import com.startupinvestment.platform.fundraising.CommitmentStatus;

public record PortfolioPosition(
        long commitmentId,
        long poolId,
        String companyName,
        String poolTitle,
        CommitmentStatus status,
        BigDecimal amount,
        BigDecimal quants,
        String currency,
        BigDecimal valuationCap,
        BigDecimal latestValuation,
        Instant valuationAt,
        BigDecimal currentValue,
        BigDecimal illustrativeGain
) {
}
