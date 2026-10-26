package com.startupinvestment.platform.marketplace;

import java.time.Instant;

public record InterestResponse(
        long id,
        long profileId,
        String companyName,
        String investorEmail,
        String message,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
}
