package com.startupinvestment.platform.startup;

import java.time.Instant;

public record StartupDocument(
        long id,
        DocumentKind kind,
        String title,
        String resourceUrl,
        Instant createdAt
) {
}
