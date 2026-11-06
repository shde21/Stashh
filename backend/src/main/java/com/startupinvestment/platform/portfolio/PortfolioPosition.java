package com.startupinvestment.platform.portfolio;

import java.math.BigDecimal;
import java.time.Instant;

import com.startupinvestment.platform.fundraising.CommitmentStatus;

public record PortfolioPosition(
        long commitmentId,
        long poolId,
        long profileId,
        String companyName,
        String poolTitle,
        CommitmentStatus status,
        BigDecimal amount,
        long shares,
        BigDecimal acquisitionPricePerShare,
        BigDecimal latestSharePrice,
        BigDecimal currentValue,
        BigDecimal illustrativeGain,
        BigDecimal gainPercentage,
        BigDecimal ownershipPercentage,
        String currency,
        BigDecimal valuationCap,
        BigDecimal latestValuation,
        Instant valuationAt
) {
}
