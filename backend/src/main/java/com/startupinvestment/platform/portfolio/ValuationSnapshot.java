package com.startupinvestment.platform.portfolio;

import java.math.BigDecimal;
import java.time.Instant;

public record ValuationSnapshot(
        long id,
        long profileId,
        String companyName,
        BigDecimal valuationAmount,
        Instant snapshotAt,
        String note,
        Instant createdAt
) {
}
