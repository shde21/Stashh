package com.startupinvestment.platform.portfolio;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioSummary(
        BigDecimal totalCommitted,
        BigDecimal totalQuants,
        BigDecimal valuedAmount,
        BigDecimal illustrativeGain,
        List<PortfolioPosition> positions
) {
}
