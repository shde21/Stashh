package com.startupinvestment.platform.platform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class PlatformStatusServiceTest {

    @Test
    void returnsDatabaseBackedFoundationStatus() {
        JdbcTemplate jdbcTemplate = org.mockito.Mockito.mock(JdbcTemplate.class);
        Clock fixedClock = Clock.fixed(Instant.parse("2026-10-22T17:00:00Z"), ZoneOffset.UTC);
        when(jdbcTemplate.queryForObject(
                "SELECT schema_version FROM platform_metadata WHERE id = 1",
                String.class
        )).thenReturn("1");

        PlatformStatusService service = new PlatformStatusService(jdbcTemplate, fixedClock);

        PlatformStatus status = service.getStatus();

        assertThat(status.service()).isEqualTo("startup-investment-platform-api");
        assertThat(status.stage()).isEqualTo("foundation");
        assertThat(status.database()).isEqualTo("connected");
        assertThat(status.migrationVersion()).isEqualTo("1");
        assertThat(status.checkedAt()).isEqualTo(Instant.parse("2026-10-22T17:00:00Z"));
    }
}
