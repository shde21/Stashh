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

    public PlatformPublicMetrics getMetrics() {
        Number totalCommitted = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM fundraising_commitments WHERE status = 'ACTIVE'",
                Number.class
        );
        Long activeStartups = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM startup_profiles WHERE review_status = 'APPROVED' AND visibility = 'PUBLIC'",
                Long.class
        );
        Long activeRounds = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM fundraising_pools WHERE status = 'OPEN'",
                Long.class
        );
        Long activeCommitments = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM fundraising_commitments WHERE status = 'ACTIVE'",
                Long.class
        );

        return new PlatformPublicMetrics(
                totalCommitted != null ? totalCommitted.longValue() : 0L,
                activeStartups != null ? activeStartups : 0L,
                activeRounds != null ? activeRounds : 0L,
                activeCommitments != null ? activeCommitments : 0L
        );
    }
}
