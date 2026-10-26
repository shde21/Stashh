package com.startupinvestment.platform.marketplace;

import java.time.Instant;

import com.startupinvestment.platform.startup.StartupStage;

public record MarketplaceStartup(
        long profileId,
        String companyName,
        String tagline,
        String sector,
        StartupStage stage,
        String note,
        Instant savedAt
) {
}
