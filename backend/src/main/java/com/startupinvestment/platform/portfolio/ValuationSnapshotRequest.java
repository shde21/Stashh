package com.startupinvestment.platform.portfolio;

import java.math.BigDecimal;
import java.time.Instant;

public record ValuationSnapshotRequest(
        long profileId,
        BigDecimal valuationAmount,
        Instant snapshotAt,
        String note
) {
}
