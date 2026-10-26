package com.startupinvestment.platform.marketplace;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.startupinvestment.platform.auth.AuthException;
import com.startupinvestment.platform.startup.ReviewStatus;
import com.startupinvestment.platform.startup.StartupProfile;
import com.startupinvestment.platform.startup.StartupRepository;
import com.startupinvestment.platform.startup.StartupVisibility;

@Service
public class MarketplaceService {

    private final MarketplaceRepository repository;
    private final StartupRepository startupRepository;

    public MarketplaceService(MarketplaceRepository repository, StartupRepository startupRepository) {
        this.repository = repository;
        this.startupRepository = startupRepository;
    }

    public List<MarketplaceStartup> watchlist(long investorUserId) {
        return repository.watchlist(investorUserId);
    }

    public void save(long investorUserId, long profileId, String note) {
        requirePublicProfile(profileId);
        if (note != null && note.trim().length() > 1000) {
            throw invalidRequest(Map.of("note", "Keep your thesis note under 1000 characters."));
        }
        repository.save(investorUserId, profileId, note);
    }

    public void remove(long investorUserId, long profileId) {
        if (!repository.remove(investorUserId, profileId)) {
            throw new AuthException("WATCHLIST_NOT_FOUND", "That startup is not in your watchlist.", 404);
        }
    }

    public InterestResponse expressInterest(long investorUserId, long profileId, InterestRequest request) {
        requirePublicProfile(profileId);
        String message = request == null ? null : request.message();
        if (message != null && message.trim().length() > 2000) {
            throw invalidRequest(Map.of("message", "Keep your introduction under 2000 characters."));
        }
        return repository.requestInterest(investorUserId, profileId, message);
    }

    public InterestResponse withdrawInterest(long investorUserId, long profileId) {
        if (!repository.withdrawInterest(investorUserId, profileId)) {
            throw new AuthException("INTEREST_NOT_FOUND", "No active pending interest request found for this startup.", 404);
        }
        return repository.findInvestorInterest(investorUserId, profileId);
    }

    public List<InterestResponse> investorInterests(long investorUserId) {
        return repository.interestsForInvestor(investorUserId);
    }

    public List<InterestResponse> startupInterests(long startupUserId) {
        return repository.interestsForStartup(startupUserId);
    }

    private StartupProfile requirePublicProfile(long profileId) {
        StartupProfile profile = startupRepository.findById(profileId)
                .orElseThrow(() -> new AuthException("PROFILE_NOT_FOUND", "The startup profile could not be found.", 404));
        if (profile.reviewStatus() != ReviewStatus.APPROVED || profile.visibility() != StartupVisibility.PUBLIC) {
            throw new AuthException("PROFILE_NOT_PUBLIC", "Only approved, public startups can be saved or contacted.", 400);
        }
        return profile;
    }

    private static AuthException invalidRequest(Map<String, String> errors) {
        return new AuthException("INVALID_REQUEST", "Review the highlighted fields.", 400, errors);
    }
}
