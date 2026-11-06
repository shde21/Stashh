package com.startupinvestment.platform.fundraising;

import java.math.BigDecimal;
import java.time.Instant;

import com.startupinvestment.platform.startup.StartupStage;

public record FundraisingPool(
        long id,
        long profileId,
        String companyName,
        String tagline,
        String sector,
        StartupStage stage,
        String title,
        BigDecimal targetAmount,
        BigDecimal minCommitment,
        BigDecimal maxCommitment,
        BigDecimal valuationCap,
        BigDecimal pricePerShare,
        long totalSharesOffered,
        long sharesRemaining,
        long sharesAllocated,
        BigDecimal roundValuationBasis,
        String currency,
        PoolStatus status,
        Instant opensAt,
        Instant endsAt,
        BigDecimal totalCommitted,
        long commitmentCount,
        BigDecimal viewerCommitment,
        Long viewerSharesAllocated
) {
}
