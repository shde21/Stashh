package com.startupinvestment.platform.fundraising;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.startupinvestment.platform.startup.StartupStage;

@Repository
public class FundraisingRepository {

    private final JdbcTemplate jdbcTemplate;

    public FundraisingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<FundraisingPool> findForStartup(long userId) {
        return findMany("sp.user_id = ?", new Object[]{userId}, null).stream().findFirst();
    }

    public Optional<FundraisingPool> findById(long poolId) {
        return findMany("p.id = ?", new Object[]{poolId}, null).stream().findFirst();
    }

    public List<FundraisingPool> findPublicOpen(String sector, StartupStage stage, String query, long viewerId) {
        List<String> predicates = new ArrayList<>();
        List<Object> args = new ArrayList<>();
        predicates.add("p.status = 'OPEN'");
        predicates.add("sp.review_status = 'APPROVED'");
        predicates.add("sp.visibility = 'PUBLIC'");
        if (sector != null && !sector.isBlank()) {
            predicates.add("LOWER(sp.sector) = LOWER(?)");
            args.add(sector.trim());
        }
        if (stage != null) {
            predicates.add("sp.startup_stage = ?");
            args.add(stage.name());
        }
        if (query != null && !query.isBlank()) {
            predicates.add("(LOWER(sp.company_name) LIKE LOWER(?) OR LOWER(sp.tagline) LIKE LOWER(?) OR LOWER(sp.sector) LIKE LOWER(?))");
            String pattern = "%" + query.trim() + "%";
            args.add(pattern);
            args.add(pattern);
            args.add(pattern);
        }
        return findMany(String.join(" AND ", predicates), args.toArray(), viewerId);
    }

    public List<FundraisingPool> findAdminPools() {
        return findMany("1 = 1 ORDER BY p.updated_at DESC", new Object[0], null);
    }

    public void savePool(long userId, FundraisingPoolRequest request) {
        int updated = jdbcTemplate.update(
                """
                UPDATE fundraising_pools
                   SET title = ?, target_amount = ?, min_commitment = ?, max_commitment = ?, valuation_cap = ?,
                       ends_at = ?, status = 'DRAFT', opens_at = NULL, updated_at = CURRENT_TIMESTAMP
                 WHERE profile_id = (SELECT id FROM startup_profiles WHERE user_id = ?)
                """,
                trim(request.title()), request.targetAmount(), request.minCommitment(), request.maxCommitment(),
                request.valuationCap(), timestamp(request.endsAt()), userId
        );
        if (updated == 0) {
            jdbcTemplate.update(
                    """
                    INSERT INTO fundraising_pools (
                        profile_id, title, target_amount, min_commitment, max_commitment, valuation_cap, ends_at
                    ) VALUES ((SELECT id FROM startup_profiles WHERE user_id = ?), ?, ?, ?, ?, ?, ?)
                    """,
                    userId, trim(request.title()), request.targetAmount(), request.minCommitment(), request.maxCommitment(),
                    request.valuationCap(), timestamp(request.endsAt())
            );
        }
    }

    public void updateStatus(long poolId, PoolStatus status, Instant opensAt) {
        jdbcTemplate.update(
                "UPDATE fundraising_pools SET status = ?, opens_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                status.name(), timestamp(opensAt), poolId
        );
    }

    public Optional<InvestorCommitment> findCommitment(long investorUserId, long poolId) {
        List<InvestorCommitment> commitments = jdbcTemplate.query(
                """
                SELECT c.id, c.pool_id, sp.company_name, p.title, c.amount, c.status, c.created_at, c.updated_at
                  FROM fundraising_commitments c
                  JOIN fundraising_pools p ON p.id = c.pool_id
                  JOIN startup_profiles sp ON sp.id = p.profile_id
                 WHERE c.investor_user_id = ? AND c.pool_id = ?
                """,
                (rs, rowNum) -> commitment(
                        rs.getLong("id"), rs.getLong("pool_id"), rs.getString("company_name"), rs.getString("title"),
                        rs.getBigDecimal("amount"), rs.getString("status"), rs.getTimestamp("created_at"), rs.getTimestamp("updated_at")
                ),
                investorUserId, poolId
        );
        return commitments.stream().findFirst();
    }

    public void saveCommitment(long investorUserId, long poolId, BigDecimal amount) {
        int updated = jdbcTemplate.update(
                """
                UPDATE fundraising_commitments
                   SET amount = ?, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
                 WHERE investor_user_id = ? AND pool_id = ?
                """,
                amount, investorUserId, poolId
        );
        if (updated == 0) {
            jdbcTemplate.update(
                    "INSERT INTO fundraising_commitments (pool_id, investor_user_id, amount) VALUES (?, ?, ?)",
                    poolId, investorUserId, amount
            );
        }
    }

    public List<InvestorCommitment> findInvestorCommitments(long investorUserId) {
        return jdbcTemplate.query(
                """
                SELECT c.id, c.pool_id, sp.company_name, p.title, c.amount, c.status, c.created_at, c.updated_at
                  FROM fundraising_commitments c
                  JOIN fundraising_pools p ON p.id = c.pool_id
                  JOIN startup_profiles sp ON sp.id = p.profile_id
                 WHERE c.investor_user_id = ?
                 ORDER BY c.updated_at DESC, c.id DESC
                """,
                (rs, rowNum) -> commitment(
                        rs.getLong("id"), rs.getLong("pool_id"), rs.getString("company_name"), rs.getString("title"),
                        rs.getBigDecimal("amount"), rs.getString("status"), rs.getTimestamp("created_at"), rs.getTimestamp("updated_at")
                ),
                investorUserId
        );
    }

    public boolean cancelCommitment(long investorUserId, long commitmentId) {
        return jdbcTemplate.update(
                "UPDATE fundraising_commitments SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND investor_user_id = ? AND status = 'ACTIVE'",
                commitmentId, investorUserId
        ) > 0;
    }

    private List<FundraisingPool> findMany(String predicate, Object[] predicateArgs, Long viewerId) {
        List<Object> args = new ArrayList<>();
        args.add(viewerId);
        for (Object arg : predicateArgs) args.add(arg);
        return jdbcTemplate.query(
                """
                SELECT p.id, p.profile_id, sp.company_name, sp.tagline, sp.sector, sp.startup_stage,
                       p.title, p.target_amount, p.min_commitment, p.max_commitment, p.valuation_cap,
                       p.currency, p.status, p.opens_at, p.ends_at,
                       COALESCE((SELECT SUM(active.amount) FROM fundraising_commitments active WHERE active.pool_id = p.id AND active.status = 'ACTIVE'), 0) AS total_committed,
                       (SELECT COUNT(*) FROM fundraising_commitments active_count WHERE active_count.pool_id = p.id AND active_count.status = 'ACTIVE') AS commitment_count,
                       viewer.amount AS viewer_commitment
                  FROM fundraising_pools p
                  JOIN startup_profiles sp ON sp.id = p.profile_id
                  LEFT JOIN fundraising_commitments viewer
                    ON viewer.pool_id = p.id AND viewer.investor_user_id = ? AND viewer.status = 'ACTIVE'
                 WHERE
                """ + predicate,
                (rs, rowNum) -> new FundraisingPool(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getString("company_name"),
                        rs.getString("tagline"),
                        rs.getString("sector"),
                        StartupStage.valueOf(rs.getString("startup_stage")),
                        rs.getString("title"),
                        rs.getBigDecimal("target_amount"),
                        rs.getBigDecimal("min_commitment"),
                        rs.getBigDecimal("max_commitment"),
                        rs.getBigDecimal("valuation_cap"),
                        rs.getString("currency"),
                        PoolStatus.valueOf(rs.getString("status")),
                        instant(rs.getTimestamp("opens_at")),
                        instant(rs.getTimestamp("ends_at")),
                        rs.getBigDecimal("total_committed"),
                        rs.getLong("commitment_count"),
                        rs.getBigDecimal("viewer_commitment")
                ),
                args.toArray()
        );
    }

    private static InvestorCommitment commitment(
            long id,
            long poolId,
            String companyName,
            String poolTitle,
            BigDecimal amount,
            String status,
            Timestamp createdAt,
            Timestamp updatedAt
    ) {
        return new InvestorCommitment(id, poolId, companyName, poolTitle, amount, CommitmentStatus.valueOf(status), instant(createdAt), instant(updatedAt));
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
}
