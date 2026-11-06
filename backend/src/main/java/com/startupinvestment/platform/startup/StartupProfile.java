package com.startupinvestment.platform.startup;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public record StartupProfile(
        long id,
        long userId,
        String companyName,
        String tagline,
        String description,
        String website,
        String sector,
        String headquarters,
        Integer foundedYear,
        StartupStage stage,
        Integer teamSize,
        String pitchUrl,
        ReviewStatus reviewStatus,
        StartupVisibility visibility,
        String reviewNote,
        Instant submittedAt,
        Instant reviewedAt,
        Instant updatedAt,
        Map<String, BigDecimal> metrics,
        List<StartupDocument> documents,
        CompanyCapitalization capitalization
) {
}
