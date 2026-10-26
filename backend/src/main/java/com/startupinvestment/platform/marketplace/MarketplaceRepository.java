package com.startupinvestment.platform.marketplace;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.startupinvestment.platform.startup.StartupStage;

@Repository
public class MarketplaceRepository {

    private final JdbcTemplate jdbcTemplate;

    public MarketplaceRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<MarketplaceStartup> watchlist(long investorUserId) {
        return jdbcTemplate.query(
                """
                SELECT w.profile_id, sp.company_name, sp.tagline, sp.sector, sp.startup_stage, w.note, w.updated_at
                  FROM investor_watchlist w
                  JOIN startup_profiles sp ON sp.id = w.profile_id
                 WHERE w.investor_user_id = ? AND sp.review_status = 'APPROVED' AND sp.visibility = 'PUBLIC'
                 ORDER BY w.updated_at DESC, w.id DESC
                """,
                (rs, rowNum) -> new MarketplaceStartup(
                        rs.getLong("profile_id"), rs.getString("company_name"), rs.getString("tagline"),
                        rs.getString("sector"), StartupStage.valueOf(rs.getString("startup_stage")),
                        rs.getString("note"), instant(rs.getTimestamp("updated_at"))
                ),
                investorUserId
        );
    }

    public boolean isSaved(long investorUserId, long profileId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM investor_watchlist WHERE investor_user_id = ? AND profile_id = ?",
                Integer.class, investorUserId, profileId
        );
        return count != null && count > 0;
    }

    public void save(long investorUserId, long profileId, String note) {
        int updated = jdbcTemplate.update(
                "UPDATE investor_watchlist SET note = ?, updated_at = CURRENT_TIMESTAMP WHERE investor_user_id = ? AND profile_id = ?",
                nullableTrim(note), investorUserId, profileId
        );
        if (updated == 0) {
            jdbcTemplate.update(
                    "INSERT INTO investor_watchlist (investor_user_id, profile_id, note) VALUES (?, ?, ?)",
                    investorUserId, profileId, nullableTrim(note)
            );
        }
    }

    public boolean remove(long investorUserId, long profileId) {
        return jdbcTemplate.update(
                "DELETE FROM investor_watchlist WHERE investor_user_id = ? AND profile_id = ?",
                investorUserId, profileId
        ) > 0;
    }

    public InterestResponse requestInterest(long investorUserId, long profileId, String message) {
        int updated = jdbcTemplate.update(
                "UPDATE investor_interest_requests SET message = ?, status = 'PENDING', updated_at = CURRENT_TIMESTAMP WHERE investor_user_id = ? AND profile_id = ?",
                nullableTrim(message), investorUserId, profileId
        );
        if (updated == 0) {
            jdbcTemplate.update(
                    "INSERT INTO investor_interest_requests (investor_user_id, profile_id, message) VALUES (?, ?, ?)",
                    investorUserId, profileId, nullableTrim(message)
            );
        }
        return findInvestorInterest(investorUserId, profileId);
    }

    public InterestResponse findInvestorInterest(long investorUserId, long profileId) {
        return jdbcTemplate.queryForObject(
                """
                SELECT r.id, r.profile_id, sp.company_name, u.email AS investor_email, r.message, r.status, r.created_at, r.updated_at
                  FROM investor_interest_requests r
                  JOIN startup_profiles sp ON sp.id = r.profile_id
                  JOIN app_users u ON u.id = r.investor_user_id
                 WHERE r.investor_user_id = ? AND r.profile_id = ?
                """,
                (rs, rowNum) -> interest(
                        rs.getLong("id"), rs.getLong("profile_id"), rs.getString("company_name"),
                        rs.getString("investor_email"), rs.getString("message"), rs.getString("status"),
                        rs.getTimestamp("created_at"), rs.getTimestamp("updated_at")
                ),
                investorUserId, profileId
        );
    }

    public boolean withdrawInterest(long investorUserId, long profileId) {
        int updated = jdbcTemplate.update(
                "UPDATE investor_interest_requests SET status = 'WITHDRAWN', updated_at = CURRENT_TIMESTAMP WHERE investor_user_id = ? AND profile_id = ? AND status = 'PENDING'",
                investorUserId, profileId
        );
        return updated > 0;
    }

    public List<InterestResponse> interestsForInvestor(long investorUserId) {
        return jdbcTemplate.query(
                """
                SELECT r.id, r.profile_id, sp.company_name, u.email AS investor_email, r.message, r.status, r.created_at, r.updated_at
                  FROM investor_interest_requests r
                  JOIN startup_profiles sp ON sp.id = r.profile_id
                  JOIN app_users u ON u.id = r.investor_user_id
                 WHERE r.investor_user_id = ?
                 ORDER BY r.updated_at DESC, r.id DESC
                """,
                (rs, rowNum) -> interest(
                        rs.getLong("id"), rs.getLong("profile_id"), rs.getString("company_name"),
                        rs.getString("investor_email"), rs.getString("message"), rs.getString("status"),
                        rs.getTimestamp("created_at"), rs.getTimestamp("updated_at")
                ),
                investorUserId
        );
    }

    public List<InterestResponse> interestsForStartup(long startupUserId) {
        return jdbcTemplate.query(
                """
                SELECT r.id, r.profile_id, sp.company_name, u.email AS investor_email, r.message, r.status, r.created_at, r.updated_at
                  FROM investor_interest_requests r
                  JOIN startup_profiles sp ON sp.id = r.profile_id
                  JOIN app_users u ON u.id = r.investor_user_id
                 WHERE sp.user_id = ?
                 ORDER BY r.updated_at DESC, r.id DESC
                """,
                (rs, rowNum) -> interest(
                        rs.getLong("id"), rs.getLong("profile_id"), rs.getString("company_name"),
                        rs.getString("investor_email"), rs.getString("message"), rs.getString("status"),
                        rs.getTimestamp("created_at"), rs.getTimestamp("updated_at")
                ),
                startupUserId
        );
    }

    private static InterestResponse interest(long id, long profileId, String companyName, String investorEmail, String message, String status, Timestamp createdAt, Timestamp updatedAt) {
        return new InterestResponse(id, profileId, companyName, investorEmail, message, status, instant(createdAt), instant(updatedAt));
    }

    private static Instant instant(Timestamp value) {
        return value == null ? null : value.toInstant();
    }

    private static String nullableTrim(String value) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
