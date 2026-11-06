package com.startupinvestment.platform.startup;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class StartupRepository {

    private final JdbcTemplate jdbcTemplate;

    public StartupRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<StartupProfile> findByUserId(long userId) {
        return findOne("WHERE user_id = ?", userId);
    }

    public Optional<StartupProfile> findById(long id) {
        return findOne("WHERE id = ?", id);
    }

    public List<StartupProfile> findReviewQueue() {
        return findMany("WHERE review_status <> 'DRAFT' ORDER BY updated_at DESC");
    }

    public List<StartupProfile> findPublicProfiles() {
        return findMany("WHERE review_status = 'APPROVED' AND visibility = 'PUBLIC' ORDER BY updated_at DESC");
    }

    public void saveProfile(
            long userId,
            StartupProfileRequest request,
            StartupStage stage,
            ReviewStatus reviewStatus,
            StartupVisibility visibility,
            String reviewNote,
            Instant submittedAt,
            Instant reviewedAt
    ) {
        int updated = jdbcTemplate.update(
                """
                UPDATE startup_profiles
                   SET company_name = ?, tagline = ?, description = ?, website = ?, sector = ?,
                       headquarters = ?, founded_year = ?, startup_stage = ?, team_size = ?, pitch_url = ?,
                       review_status = ?, visibility = ?, review_note = ?, submitted_at = ?, reviewed_at = ?,
                       updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = ?
                """,
                trim(request.companyName()), nullableTrim(request.tagline()), nullableTrim(request.description()),
                nullableTrim(request.website()), nullableTrim(request.sector()), nullableTrim(request.headquarters()),
                request.foundedYear(), stage.name(), request.teamSize(), nullableTrim(request.pitchUrl()),
                reviewStatus.name(), visibility.name(), nullableTrim(reviewNote), timestamp(submittedAt), timestamp(reviewedAt),
                userId
        );
        if (updated == 0) {
            jdbcTemplate.update(
                    """
                    INSERT INTO startup_profiles (
                        user_id, company_name, tagline, description, website, sector, headquarters,
                        founded_year, startup_stage, team_size, pitch_url, review_status, visibility,
                        review_note, submitted_at, reviewed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    userId, trim(request.companyName()), nullableTrim(request.tagline()), nullableTrim(request.description()),
                    nullableTrim(request.website()), nullableTrim(request.sector()), nullableTrim(request.headquarters()),
                    request.foundedYear(), stage.name(), request.teamSize(), nullableTrim(request.pitchUrl()),
                    reviewStatus.name(), visibility.name(), nullableTrim(reviewNote), timestamp(submittedAt), timestamp(reviewedAt)
            );
        }
        long profileId = findProfileIdByUserId(userId);
        jdbcTemplate.update(
                """
                INSERT INTO company_capitalization (
                    profile_id, authorized_shares, issued_shares, outstanding_shares,
                    treasury_shares, reserved_shares, share_class, par_value
                )
                SELECT ?, 10000000, 1000000, 1000000, 0, 0, 'EQUITY', 10.00
                 WHERE NOT EXISTS (SELECT 1 FROM company_capitalization WHERE profile_id = ?)
                """,
                profileId, profileId
        );
        jdbcTemplate.update("DELETE FROM startup_metrics WHERE profile_id = ?", profileId);
        Map<String, BigDecimal> metrics = request.metrics() == null ? Map.of() : request.metrics();
        metrics.forEach((key, value) -> jdbcTemplate.update(
                "INSERT INTO startup_metrics (profile_id, metric_key, metric_value) VALUES (?, ?, ?)",
                profileId,
                key,
                value
        ));
    }

    public void updateReviewState(
            long profileId,
            ReviewStatus reviewStatus,
            StartupVisibility visibility,
            String reviewNote,
            Instant reviewedAt
    ) {
        jdbcTemplate.update(
                """
                UPDATE startup_profiles
                   SET review_status = ?, visibility = ?, review_note = ?, reviewed_at = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?
                """,
                reviewStatus.name(), visibility.name(), nullableTrim(reviewNote), timestamp(reviewedAt), profileId
        );
    }

    public void updateVisibility(long profileId, StartupVisibility visibility) {
        jdbcTemplate.update(
                "UPDATE startup_profiles SET visibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                visibility.name(), profileId
        );
    }

    public void addReviewAction(long profileId, long adminUserId, String action, String note) {
        jdbcTemplate.update(
                "INSERT INTO startup_review_actions (profile_id, admin_user_id, action, note) VALUES (?, ?, ?, ?)",
                profileId, adminUserId, action, nullableTrim(note)
        );
    }

    public StartupDocument addDocument(long profileId, DocumentKind kind, String title, String resourceUrl) {
        jdbcTemplate.update(
                "INSERT INTO startup_documents (profile_id, kind, title, resource_url) VALUES (?, ?, ?, ?)",
                profileId, kind.name(), trim(title), trim(resourceUrl)
        );
        return jdbcTemplate.queryForObject(
                "SELECT id, kind, title, resource_url, created_at FROM startup_documents WHERE profile_id = ? AND title = ? AND resource_url = ? ORDER BY id DESC",
                (rs, rowNum) -> document(rs.getLong("id"), rs.getString("kind"), rs.getString("title"), rs.getString("resource_url"), rs.getTimestamp("created_at")),
                profileId, trim(title), trim(resourceUrl)
        );
    }

    public boolean deleteDocument(long documentId, long userId) {
        return jdbcTemplate.update(
                "DELETE FROM startup_documents WHERE id = ? AND profile_id = (SELECT id FROM startup_profiles WHERE user_id = ?)",
                documentId, userId
        ) > 0;
    }

    private Optional<StartupProfile> findOne(String suffix, Object... args) {
        List<StartupProfile> profiles = findMany(suffix, args);
        return profiles.stream().findFirst();
    }

    private List<StartupProfile> findMany(String suffix, Object... args) {
        List<ProfileRow> rows = jdbcTemplate.query(
                """
                SELECT id, user_id, company_name, tagline, description, website, sector, headquarters,
                       founded_year, startup_stage, team_size, pitch_url, review_status, visibility,
                       review_note, submitted_at, reviewed_at, updated_at
                  FROM startup_profiles
                """ + suffix,
                (rs, rowNum) -> new ProfileRow(
                        rs.getLong("id"),
                        rs.getLong("user_id"),
                        rs.getString("company_name"),
                        rs.getString("tagline"),
                        rs.getString("description"),
                        rs.getString("website"),
                        rs.getString("sector"),
                        rs.getString("headquarters"),
                        (Integer) rs.getObject("founded_year"),
                        StartupStage.valueOf(rs.getString("startup_stage")),
                        (Integer) rs.getObject("team_size"),
                        rs.getString("pitch_url"),
                        ReviewStatus.valueOf(rs.getString("review_status")),
                        StartupVisibility.valueOf(rs.getString("visibility")),
                        rs.getString("review_note"),
                        instant(rs.getTimestamp("submitted_at")),
                        instant(rs.getTimestamp("reviewed_at")),
                        instant(rs.getTimestamp("updated_at"))
                ),
                args
        );
        List<StartupProfile> profiles = new ArrayList<>();
        for (ProfileRow row : rows) {
            profiles.add(toProfile(row));
        }
        return profiles;
    }

    public Optional<CompanyCapitalization> findCapitalization(long profileId) {
        List<CompanyCapitalization> list = jdbcTemplate.query(
                """
                SELECT id, profile_id, authorized_shares, issued_shares, outstanding_shares,
                       treasury_shares, reserved_shares, share_class, par_value, updated_at
                  FROM company_capitalization
                 WHERE profile_id = ?
                """,
                (rs, rowNum) -> CompanyCapitalization.of(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getLong("authorized_shares"),
                        rs.getLong("issued_shares"),
                        rs.getLong("outstanding_shares"),
                        rs.getLong("treasury_shares"),
                        rs.getLong("reserved_shares"),
                        rs.getString("share_class"),
                        rs.getBigDecimal("par_value"),
                        instant(rs.getTimestamp("updated_at"))
                ),
                profileId
        );
        return list.stream().findFirst();
    }

    public void saveCapitalization(long profileId, CompanyCapitalizationRequest request) {
        long authorized = request.authorizedShares() != null ? request.authorizedShares() : 10000000L;
        long outstanding = request.outstandingShares() != null ? request.outstandingShares() : 1000000L;
        long treasury = request.treasuryShares() != null ? request.treasuryShares() : 0L;
        long issued = request.issuedShares() != null ? request.issuedShares() : (outstanding + treasury);
        long reserved = request.reservedShares() != null ? request.reservedShares() : 0L;
        String shareClass = request.shareClass() != null && !request.shareClass().isBlank() ? request.shareClass().trim() : "EQUITY";
        BigDecimal parValue = request.parValue() != null ? request.parValue() : BigDecimal.valueOf(10);

        int updated = jdbcTemplate.update(
                """
                UPDATE company_capitalization
                   SET authorized_shares = ?, issued_shares = ?, outstanding_shares = ?,
                       treasury_shares = ?, reserved_shares = ?, share_class = ?, par_value = ?,
                       updated_at = CURRENT_TIMESTAMP
                 WHERE profile_id = ?
                """,
                authorized, issued, outstanding, treasury, reserved, shareClass, parValue, profileId
        );
        if (updated == 0) {
            jdbcTemplate.update(
                    """
                    INSERT INTO company_capitalization (
                        profile_id, authorized_shares, issued_shares, outstanding_shares,
                        treasury_shares, reserved_shares, share_class, par_value
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    profileId, authorized, issued, outstanding, treasury, reserved, shareClass, parValue
            );
        }
    }

    private StartupProfile toProfile(ProfileRow row) {
        Map<String, BigDecimal> metrics = new LinkedHashMap<>();
        jdbcTemplate.query(
                "SELECT metric_key, metric_value FROM startup_metrics WHERE profile_id = ? ORDER BY id",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> metrics.put(rs.getString("metric_key"), rs.getBigDecimal("metric_value")),
                row.id()
        );
        List<StartupDocument> documents = jdbcTemplate.query(
                "SELECT id, kind, title, resource_url, created_at FROM startup_documents WHERE profile_id = ? ORDER BY created_at DESC, id DESC",
                (rs, rowNum) -> document(rs.getLong("id"), rs.getString("kind"), rs.getString("title"), rs.getString("resource_url"), rs.getTimestamp("created_at")),
                row.id()
        );
        CompanyCapitalization capitalization = findCapitalization(row.id()).orElse(null);
        return new StartupProfile(
                row.id(), row.userId(), row.companyName(), row.tagline(), row.description(), row.website(),
                row.sector(), row.headquarters(), row.foundedYear(), row.stage(), row.teamSize(), row.pitchUrl(),
                row.reviewStatus(), row.visibility(), row.reviewNote(), row.submittedAt(), row.reviewedAt(), row.updatedAt(),
                metrics, documents, capitalization
        );
    }

    private long findProfileIdByUserId(long userId) {
        Long id = jdbcTemplate.queryForObject("SELECT id FROM startup_profiles WHERE user_id = ?", Long.class, userId);
        if (id == null) {
            throw new IllegalStateException("Startup profile was not returned by the database");
        }
        return id;
    }

    private static StartupDocument document(long id, String kind, String title, String resourceUrl, Timestamp createdAt) {
        return new StartupDocument(id, DocumentKind.valueOf(kind), title, resourceUrl, instant(createdAt));
    }

    private static Timestamp timestamp(Instant value) {
        return value == null ? null : Timestamp.from(value);
    }

    private static Instant instant(Timestamp value) {
        return value == null ? null : value.toInstant();
    }

    private static String trim(String value) {
        return value == null ? "" : value.trim();
    }

    private static String nullableTrim(String value) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private record ProfileRow(
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
            Instant updatedAt
    ) {
    }
}
