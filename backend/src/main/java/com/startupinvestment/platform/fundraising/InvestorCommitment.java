package com.startupinvestment.platform.fundraising;

import java.math.BigDecimal;
import java.time.Instant;

public record InvestorCommitment(
        long id,
        long poolId,
        String companyName,
        String poolTitle,
        BigDecimal amount,
        long sharesAllocated,
        BigDecimal pricePerShare,
        CommitmentStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
