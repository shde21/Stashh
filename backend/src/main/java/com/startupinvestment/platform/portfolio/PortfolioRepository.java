package com.startupinvestment.platform.portfolio;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.startupinvestment.platform.fundraising.CommitmentStatus;

@Repository
public class PortfolioRepository {

    private final JdbcTemplate jdbcTemplate;

    public PortfolioRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ValuationSnapshot insertSnapshot(long adminUserId, ValuationSnapshotRequest request) {
        jdbcTemplate.update(
                "INSERT INTO valuation_snapshots (profile_id, admin_user_id, valuation_amount, snapshot_at, note) VALUES (?, ?, ?, ?, ?)",
                request.profileId(), adminUserId, request.valuationAmount(), timestamp(request.snapshotAt()), nullableTrim(request.note())
        );
        return jdbcTemplate.queryForObject(
                """
                SELECT v.id, v.profile_id, sp.company_name, v.valuation_amount, v.snapshot_at, v.note, v.created_at
                  FROM valuation_snapshots v
                  JOIN startup_profiles sp ON sp.id = v.profile_id
                 WHERE v.profile_id = ?
                 ORDER BY v.id DESC
                 LIMIT 1
                """,
                (rs, rowNum) -> snapshot(
                        rs.getLong("id"), rs.getLong("profile_id"), rs.getString("company_name"),
                        rs.getBigDecimal("valuation_amount"), rs.getTimestamp("snapshot_at"),
                        rs.getString("note"), rs.getTimestamp("created_at")
                ),
                request.profileId()
        );
    }

    public List<ValuationSnapshot> findSnapshots() {
        return jdbcTemplate.query(
                """
                SELECT v.id, v.profile_id, sp.company_name, v.valuation_amount, v.snapshot_at, v.note, v.created_at
                  FROM valuation_snapshots v
                  JOIN startup_profiles sp ON sp.id = v.profile_id
                 ORDER BY v.snapshot_at DESC, v.id DESC
                """,
                (rs, rowNum) -> snapshot(
                        rs.getLong("id"), rs.getLong("profile_id"), rs.getString("company_name"),
                        rs.getBigDecimal("valuation_amount"), rs.getTimestamp("snapshot_at"),
                        rs.getString("note"), rs.getTimestamp("created_at")
                )
        );
    }

    public List<PortfolioRow> findInvestorPositions(long investorUserId) {
        return jdbcTemplate.query(
                """
                SELECT c.id, c.pool_id, sp.id AS profile_id, sp.company_name, p.title, c.status, c.amount,
                       c.shares_allocated, c.price_per_share, p.currency, p.valuation_cap, p.round_valuation_basis,
                       COALESCE(cc.outstanding_shares, 1000000) AS outstanding_shares,
                       p.shares_allocated AS pool_shares_allocated,
                       latest.valuation_amount, latest.snapshot_at
                  FROM fundraising_commitments c
                  JOIN fundraising_pools p ON p.id = c.pool_id
                  JOIN startup_profiles sp ON sp.id = p.profile_id
                  LEFT JOIN company_capitalization cc ON cc.profile_id = sp.id
                  LEFT JOIN valuation_snapshots latest
                    ON latest.id = (
                        SELECT candidate.id
                          FROM valuation_snapshots candidate
                         WHERE candidate.profile_id = sp.id
                         ORDER BY candidate.snapshot_at DESC, candidate.id DESC
                         LIMIT 1
                    )
                 WHERE c.investor_user_id = ?
                 ORDER BY c.updated_at DESC, c.id DESC
                """,
                (rs, rowNum) -> new PortfolioRow(
                        rs.getLong("id"),
                        rs.getLong("pool_id"),
                        rs.getLong("profile_id"),
                        rs.getString("company_name"),
                        rs.getString("title"),
                        CommitmentStatus.valueOf(rs.getString("status")),
                        rs.getBigDecimal("amount"),
                        rs.getLong("shares_allocated"),
                        rs.getBigDecimal("price_per_share"),
                        rs.getString("currency"),
                        rs.getBigDecimal("valuation_cap"),
                        rs.getBigDecimal("round_valuation_basis"),
                        rs.getLong("outstanding_shares"),
                        rs.getLong("pool_shares_allocated"),
                        rs.getBigDecimal("valuation_amount"),
                        instant(rs.getTimestamp("snapshot_at"))
                ),
                investorUserId
        );
    }

    private static ValuationSnapshot snapshot(
            long id,
            long profileId,
            String companyName,
            BigDecimal valuationAmount,
            Timestamp snapshotAt,
            String note,
            Timestamp createdAt
    ) {
        return new ValuationSnapshot(id, profileId, companyName, valuationAmount, instant(snapshotAt), note, instant(createdAt));
    }

    private static Timestamp timestamp(Instant value) {
        return value == null ? null : Timestamp.from(value);
    }

    private static Instant instant(Timestamp value) {
        return value == null ? null : value.toInstant();
    }

    private static String nullableTrim(String value) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    public record PortfolioRow(
            long commitmentId,
            long poolId,
            long profileId,
            String companyName,
            String poolTitle,
            CommitmentStatus status,
            BigDecimal amount,
            long sharesAllocated,
            BigDecimal pricePerShare,
            String currency,
            BigDecimal valuationCap,
            BigDecimal roundValuationBasis,
            long outstandingShares,
            long poolSharesAllocated,
            BigDecimal latestValuation,
            Instant valuationAt
    ) {
    }
}
