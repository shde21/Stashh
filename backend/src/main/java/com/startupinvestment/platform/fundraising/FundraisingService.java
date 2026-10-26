package com.startupinvestment.platform.fundraising;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.startupinvestment.platform.auth.AuthException;
import com.startupinvestment.platform.startup.ReviewStatus;
import com.startupinvestment.platform.startup.StartupProfile;
import com.startupinvestment.platform.startup.StartupRepository;
import com.startupinvestment.platform.startup.StartupStage;
import com.startupinvestment.platform.startup.StartupVisibility;

@Service
public class FundraisingService {

    private final FundraisingRepository repository;
    private final StartupRepository startupRepository;

    public FundraisingService(FundraisingRepository repository, StartupRepository startupRepository) {
        this.repository = repository;
        this.startupRepository = startupRepository;
    }

    public Optional<FundraisingPool> findForStartup(long userId) {
        return repository.findForStartup(userId);
    }

    public FundraisingPool saveForStartup(long userId, FundraisingPoolRequest request) {
        requireFundraisingReady(userId);
        validate(request);
        FundraisingPool existing = repository.findForStartup(userId).orElse(null);
        if (existing != null && existing.status() == PoolStatus.OPEN) {
            throw new AuthException("POOL_OPEN", "Close the active pool before changing its terms.", 409);
        }
        repository.savePool(userId, request);
        return repository.findForStartup(userId)
                .orElseThrow(() -> new IllegalStateException("Saved fundraising pool was not returned"));
    }

    public FundraisingPool setStartupStatus(long userId, PoolStatus status) {
        requireFundraisingReady(userId);
        FundraisingPool pool = repository.findForStartup(userId)
                .orElseThrow(() -> new AuthException("POOL_REQUIRED", "Save fundraising terms before opening a pool.", 400));
        if (status == PoolStatus.OPEN && pool.endsAt() != null && !pool.endsAt().isAfter(Instant.now())) {
            throw new AuthException("POOL_EXPIRED", "The pool end date has passed.", 400);
        }
        validateStatusChange(pool, status);
        repository.updateStatus(pool.id(), status, status == PoolStatus.OPEN ? Instant.now() : pool.opensAt());
        return repository.findById(pool.id()).orElseThrow(() -> new IllegalStateException("Updated fundraising pool was not returned"));
    }

    public List<FundraisingPool> findPublicPools(String sector, StartupStage stage, String query, long investorUserId) {
        return repository.findPublicOpen(sector, stage, query, investorUserId);
    }

    public List<FundraisingPool> findAdminPools() {
        return repository.findAdminPools();
    }

    public FundraisingPool setAdminStatus(long poolId, PoolStatus status) {
        FundraisingPool pool = repository.findById(poolId)
                .orElseThrow(() -> new AuthException("POOL_NOT_FOUND", "The fundraising pool could not be found.", 404));
        if (status == PoolStatus.OPEN) {
            if (pool.status() == PoolStatus.OPEN) return pool;
            if (pool.endsAt() != null && !pool.endsAt().isAfter(Instant.now())) {
                throw new AuthException("POOL_EXPIRED", "The pool end date has passed.", 400);
            }
            StartupProfile profile = startupRepository.findById(pool.profileId())
                    .orElseThrow(() -> new AuthException("PROFILE_NOT_FOUND", "The startup profile could not be found.", 404));
            if (profile.reviewStatus() != ReviewStatus.APPROVED || profile.visibility() != StartupVisibility.PUBLIC) {
                throw new AuthException("PROFILE_NOT_PUBLIC", "Only approved, public startup profiles can open a pool.", 400);
            }
        }
        validateStatusChange(pool, status);
        repository.updateStatus(poolId, status, status == PoolStatus.OPEN ? Instant.now() : pool.opensAt());
        return repository.findById(poolId).orElseThrow(() -> new IllegalStateException("Updated fundraising pool was not returned"));
    }

    public InvestorCommitment commit(long investorUserId, long poolId, CommitmentRequest request) {
        FundraisingPool pool = repository.findById(poolId)
                .orElseThrow(() -> new AuthException("POOL_NOT_FOUND", "The fundraising pool could not be found.", 404));
        if (pool.status() != PoolStatus.OPEN) {
            throw new AuthException("POOL_NOT_OPEN", "This fundraising pool is not accepting commitments.", 409);
        }
        if (pool.endsAt() != null && !pool.endsAt().isAfter(Instant.now())) {
            throw new AuthException("POOL_EXPIRED", "The pool end date has passed.", 409);
        }
        BigDecimal amount = request == null ? null : request.amount();
        Map<String, String> errors = new LinkedHashMap<>();
        if (amount == null || amount.signum() <= 0) {
            errors.put("amount", "Enter a positive commitment amount.");
        } else {
            if (amount.compareTo(pool.minCommitment()) < 0) errors.put("amount", "The commitment is below this pool's minimum.");
            if (pool.maxCommitment() != null && amount.compareTo(pool.maxCommitment()) > 0) errors.put("amount", "The commitment exceeds this pool's maximum.");
            if (amount.add(pool.totalCommitted()).compareTo(pool.targetAmount()) > 0) errors.put("amount", "This commitment would exceed the remaining pool capacity.");
        }
        if (!errors.isEmpty()) throw invalidRequest(errors);
        Optional<InvestorCommitment> current = repository.findCommitment(investorUserId, poolId);
        if (current.isPresent() && current.get().status() == CommitmentStatus.ACTIVE) {
            throw new AuthException("COMMITMENT_EXISTS", "You already have an active commitment in this pool.", 409);
        }
        repository.saveCommitment(investorUserId, poolId, amount);
        return repository.findCommitment(investorUserId, poolId)
                .orElseThrow(() -> new IllegalStateException("Saved commitment was not returned"));
    }

    public List<InvestorCommitment> commitments(long investorUserId) {
        return repository.findInvestorCommitments(investorUserId);
    }

    public void cancelCommitment(long investorUserId, long commitmentId) {
        if (!repository.cancelCommitment(investorUserId, commitmentId)) {
            throw new AuthException("COMMITMENT_NOT_FOUND", "That active commitment could not be found.", 404);
        }
    }

    private StartupProfile requireFundraisingReady(long userId) {
        StartupProfile profile = startupRepository.findByUserId(userId)
                .orElseThrow(() -> new AuthException("PROFILE_REQUIRED", "Complete your startup profile before configuring a pool.", 400));
        if (profile.reviewStatus() != ReviewStatus.APPROVED || profile.visibility() != StartupVisibility.PUBLIC) {
            throw new AuthException("PROFILE_NOT_PUBLIC", "Your startup profile must be approved and public before fundraising can open.", 400);
        }
        return profile;
    }

    private void validate(FundraisingPoolRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (request == null || blank(request.title())) errors.put("title", "Name the fundraising round.");
        if (request == null || request.targetAmount() == null || request.targetAmount().signum() <= 0) errors.put("targetAmount", "Set a positive target amount.");
        if (request == null || request.minCommitment() == null || request.minCommitment().signum() <= 0) errors.put("minCommitment", "Set a positive minimum commitment.");
        if (request != null && request.targetAmount() != null && request.minCommitment() != null && request.minCommitment().compareTo(request.targetAmount()) > 0) errors.put("minCommitment", "The minimum cannot exceed the target.");
        if (request != null && request.maxCommitment() != null && request.minCommitment() != null && request.maxCommitment().compareTo(request.minCommitment()) < 0) errors.put("maxCommitment", "The maximum cannot be below the minimum.");
        if (request != null && request.valuationCap() != null && request.valuationCap().signum() <= 0) errors.put("valuationCap", "The valuation cap must be positive.");
        if (request != null && request.endsAt() != null && !request.endsAt().isAfter(Instant.now())) errors.put("endsAt", "Choose a future end date.");
        if (!errors.isEmpty()) throw invalidRequest(errors);
    }

    private void validateStatusChange(FundraisingPool pool, PoolStatus status) {
        if (status == PoolStatus.DRAFT) {
            throw new AuthException("INVALID_POOL_STATUS", "A pool can only be opened or closed from this workflow.", 400);
        }
        if (status == PoolStatus.CLOSED && pool.status() == PoolStatus.CLOSED) return;
    }

    private static AuthException invalidRequest(Map<String, String> errors) {
        return new AuthException("INVALID_REQUEST", "Review the highlighted fields.", 400, errors);
    }

    private static boolean blank(String value) {
        return value == null || value.trim().isBlank();
    }
}
