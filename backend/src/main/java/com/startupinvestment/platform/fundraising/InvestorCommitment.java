package com.startupinvestment.platform.fundraising;

import java.math.BigDecimal;
import java.time.Instant;

public record InvestorCommitment(
        long id,
        long poolId,
        String companyName,
        String poolTitle,
        BigDecimal amount,
        CommitmentStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
