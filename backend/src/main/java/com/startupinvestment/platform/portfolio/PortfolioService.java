package com.startupinvestment.platform.portfolio;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.startupinvestment.platform.auth.AuthException;
import com.startupinvestment.platform.fundraising.CommitmentStatus;
import com.startupinvestment.platform.startup.ReviewStatus;
import com.startupinvestment.platform.startup.StartupProfile;
import com.startupinvestment.platform.startup.StartupRepository;
import com.startupinvestment.platform.startup.StartupVisibility;

@Service
public class PortfolioService {

    private static final int MONEY_SCALE = 2;
    private static final int SHARE_PRICE_SCALE = 4;
    private static final int PERCENT_SCALE = 4;

    private final PortfolioRepository repository;
    private final StartupRepository startupRepository;

    public PortfolioService(PortfolioRepository repository, StartupRepository startupRepository) {
        this.repository = repository;
        this.startupRepository = startupRepository;
    }

    public PortfolioSummary investorPortfolio(long investorUserId) {
        List<PortfolioPosition> positions = new ArrayList<>();
        BigDecimal totalCommitted = BigDecimal.ZERO;
        BigDecimal valuedAmount = BigDecimal.ZERO;
        BigDecimal illustrativeGain = BigDecimal.ZERO;
        int activeCount = 0;

        for (PortfolioRepository.PortfolioRow row : repository.findInvestorPositions(investorUserId)) {
            long shares = row.sharesAllocated();
            BigDecimal acquisitionPrice = row.pricePerShare();
            BigDecimal latestValuation = row.latestValuation();
            long baseShares = row.outstandingShares() > 0 ? row.outstandingShares() : 1_000_000L;
            long totalCompanyShares = row.outstandingShares() + row.poolSharesAllocated();
            if (totalCompanyShares <= 0) {
                totalCompanyShares = baseShares;
            }

            BigDecimal latestSharePrice = null;
            BigDecimal currentValue = null;
            BigDecimal gain = null;
            BigDecimal gainPercentage = null;

            if (latestValuation != null && latestValuation.signum() > 0) {
                latestSharePrice = latestValuation.divide(BigDecimal.valueOf(baseShares), SHARE_PRICE_SCALE, RoundingMode.HALF_UP);
                currentValue = BigDecimal.valueOf(shares).multiply(latestSharePrice).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
                gain = currentValue.subtract(row.amount()).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
                if (row.amount().signum() > 0) {
                    gainPercentage = gain.multiply(BigDecimal.valueOf(100)).divide(row.amount(), 2, RoundingMode.HALF_UP);
                }
            }

            BigDecimal ownershipPercentage = null;
            if (totalCompanyShares > 0 && shares > 0) {
                ownershipPercentage = BigDecimal.valueOf(shares)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalCompanyShares), PERCENT_SCALE, RoundingMode.HALF_UP);
            }

            positions.add(new PortfolioPosition(
                    row.commitmentId(), row.poolId(), row.profileId(), row.companyName(), row.poolTitle(),
                    row.status(), row.amount(), shares, acquisitionPrice, latestSharePrice,
                    currentValue, gain, gainPercentage, ownershipPercentage,
                    row.currency(), row.valuationCap(), latestValuation, row.valuationAt()
            ));

            if (row.status() == CommitmentStatus.ACTIVE) {
                totalCommitted = totalCommitted.add(row.amount());
                activeCount++;
                if (currentValue != null) {
                    valuedAmount = valuedAmount.add(currentValue);
                    illustrativeGain = illustrativeGain.add(gain);
                }
            }
        }

        return new PortfolioSummary(
                money(totalCommitted),
                money(valuedAmount),
                money(illustrativeGain),
                activeCount,
                positions
        );
    }

    public ValuationSnapshot createSnapshot(long adminUserId, ValuationSnapshotRequest request) {
        validate(request);
        StartupProfile profile = startupRepository.findById(request.profileId())
                .orElseThrow(() -> new AuthException("PROFILE_NOT_FOUND", "The startup profile could not be found.", 404));
        if (profile.reviewStatus() != ReviewStatus.APPROVED || profile.visibility() != StartupVisibility.PUBLIC) {
            throw new AuthException("PROFILE_NOT_PUBLIC", "Valuations can only be recorded for approved, public profiles.", 400);
        }
        return repository.insertSnapshot(adminUserId, request);
    }

    public List<ValuationSnapshot> snapshots() {
        return repository.findSnapshots();
    }

    private void validate(ValuationSnapshotRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (request == null || request.profileId() <= 0) errors.put("profileId", "Choose a startup profile.");
        if (request == null || request.valuationAmount() == null || request.valuationAmount().signum() <= 0) errors.put("valuationAmount", "Enter a positive valuation.");
        if (request == null || request.snapshotAt() == null) errors.put("snapshotAt", "Choose when this valuation was recorded.");
        else if (request.snapshotAt().isAfter(Instant.now())) errors.put("snapshotAt", "A valuation snapshot cannot be in the future.");
        if (!errors.isEmpty()) throw new AuthException("INVALID_REQUEST", "Review the highlighted fields.", 400, errors);
    }

    private static BigDecimal money(BigDecimal value) {
        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
