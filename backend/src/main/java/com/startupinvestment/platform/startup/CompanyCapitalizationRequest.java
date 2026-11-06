package com.startupinvestment.platform.startup;

import java.math.BigDecimal;

public record CompanyCapitalizationRequest(
        Long authorizedShares,
        Long issuedShares,
        Long outstandingShares,
        Long treasuryShares,
        Long reservedShares,
        String shareClass,
        BigDecimal parValue
) {
}
