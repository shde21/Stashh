package com.startupinvestment.platform.startup;

import java.math.BigDecimal;
import java.util.Map;

public record StartupProfileRequest(
        String companyName,
        String tagline,
        String description,
        String website,
        String sector,
        String headquarters,
        Integer foundedYear,
        String stage,
        Integer teamSize,
        String pitchUrl,
        Map<String, BigDecimal> metrics
) {
}
