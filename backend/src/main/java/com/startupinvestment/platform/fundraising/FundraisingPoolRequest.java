package com.startupinvestment.platform.fundraising;

import java.math.BigDecimal;
import java.time.Instant;

public record FundraisingPoolRequest(
        String title,
        BigDecimal targetAmount,
        BigDecimal minCommitment,
        BigDecimal maxCommitment,
        BigDecimal valuationCap,
        BigDecimal pricePerShare,
        Long totalSharesOffered,
        BigDecimal roundValuationBasis,
        Instant endsAt
) {
}
