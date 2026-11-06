package com.startupinvestment.platform.startup;

import java.math.BigDecimal;
import java.time.Instant;

public record CompanyCapitalization(
        long id,
        long profileId,
        long authorizedShares,
        long issuedShares,
        long outstandingShares,
        long treasuryShares,
        long reservedShares,
        String shareClass,
        BigDecimal parValue,
        long unissuedShares,
        long fullyDilutedShares,
        Instant updatedAt
) {
    public static CompanyCapitalization of(
            long id,
            long profileId,
            long authorizedShares,
            long issuedShares,
            long outstandingShares,
            long treasuryShares,
            long reservedShares,
            String shareClass,
            BigDecimal parValue,
            Instant updatedAt
    ) {
        long unissuedShares = Math.max(0, authorizedShares - (issuedShares + reservedShares));
        long fullyDilutedShares = outstandingShares + reservedShares;
        return new CompanyCapitalization(
                id,
                profileId,
                authorizedShares,
                issuedShares,
                outstandingShares,
                treasuryShares,
                reservedShares,
                shareClass == null ? "EQUITY" : shareClass,
                parValue == null ? BigDecimal.valueOf(10) : parValue,
                unissuedShares,
                fullyDilutedShares,
                updatedAt
        );
    }
}
