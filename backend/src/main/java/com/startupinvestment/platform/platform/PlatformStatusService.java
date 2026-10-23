package com.startupinvestment.platform.platform;

import java.time.Clock;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class PlatformStatusService {

    private final JdbcTemplate jdbcTemplate;
    private final Clock clock;

    @Autowired
    public PlatformStatusService(JdbcTemplate jdbcTemplate) {
        this(jdbcTemplate, Clock.systemUTC());
    }

    PlatformStatusService(JdbcTemplate jdbcTemplate, Clock clock) {
        this.jdbcTemplate = jdbcTemplate;
        this.clock = clock;
    }

    public PlatformStatus getStatus() {
        String migrationVersion = jdbcTemplate.queryForObject(
                "SELECT schema_version FROM platform_metadata WHERE id = 1",
                String.class
        );

        return new PlatformStatus(
                "startup-investment-platform-api",
                "foundation",
                "connected",
                migrationVersion,
                Instant.now(clock)
        );
    }
}
