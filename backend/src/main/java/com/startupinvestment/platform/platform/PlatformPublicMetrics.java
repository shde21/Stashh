package com.startupinvestment.platform.platform;

public record PlatformPublicMetrics(
        long totalCapitalCommitted,
        long activeStartupsCount,
        long activeRoundsCount,
        long activeCommitmentsCount
) {
}
