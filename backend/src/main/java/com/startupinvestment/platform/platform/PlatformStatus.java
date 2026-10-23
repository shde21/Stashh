package com.startupinvestment.platform.platform;

import java.time.Instant;

public record PlatformStatus(
        String service,
        String stage,
        String database,
        String migrationVersion,
        Instant checkedAt
) {
}
