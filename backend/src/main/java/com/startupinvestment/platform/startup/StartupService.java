package com.startupinvestment.platform.startup;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.startupinvestment.platform.auth.AuthException;

@Service
public class StartupService {

    private static final Map<StartupStage, Set<String>> REQUIRED_METRICS = Map.of(
            StartupStage.PRE_REVENUE, Set.of("active_users", "runway_months"),
            StartupStage.EARLY_REVENUE, Set.of("monthly_revenue", "monthly_growth_percent", "active_users"),
            StartupStage.GROWTH, Set.of("annual_revenue", "monthly_growth_percent", "active_users")
    );

    private final StartupRepository repository;

    public StartupService(StartupRepository repository) {
        this.repository = repository;
    }

    public Optional<StartupProfile> findForStartup(long userId) {
        return repository.findByUserId(userId);
    }

    public StartupProfile saveProfile(long userId, StartupProfileRequest request) {
        StartupStage stage = parseStage(request.stage());
        validateProfile(request, stage, false);
        StartupProfile existing = repository.findByUserId(userId).orElse(null);
        repository.saveProfile(
                userId,
                request,
                stage,
                ReviewStatus.DRAFT,
                StartupVisibility.PRIVATE,
                existing != null && existing.reviewStatus() == ReviewStatus.CHANGES_REQUESTED ? existing.reviewNote() : null,
                null,
                null
        );
        return repository.findByUserId(userId).orElseThrow(() -> new IllegalStateException("Saved startup profile was not returned"));
    }

    public Optional<CompanyCapitalization> findCapitalization(long userId) {
        StartupProfile profile = repository.findByUserId(userId)
                .orElseThrow(() -> new AuthException("PROFILE_REQUIRED", "Save your company profile first.", 400));
        return repository.findCapitalization(profile.id());
    }

    public CompanyCapitalization saveCapitalization(long userId, CompanyCapitalizationRequest request) {
        StartupProfile profile = repository.findByUserId(userId)
                .orElseThrow(() -> new AuthException("PROFILE_REQUIRED", "Save your company profile first.", 400));
        validateCapitalization(request);
        repository.saveCapitalization(profile.id(), request);
        return repository.findCapitalization(profile.id())
                .orElseThrow(() -> new IllegalStateException("Saved capitalization was not returned"));
    }

    private void validateCapitalization(CompanyCapitalizationRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (request == null) {
            errors.put("capitalization", "Capitalization payload is required.");
            throw new AuthException("INVALID_REQUEST", "Review the highlighted fields.", 400, errors);
        }
        long auth = request.authorizedShares() != null ? request.authorizedShares() : 10000000L;
        long out = request.outstandingShares() != null ? request.outstandingShares() : 1000000L;
        long tr = request.treasuryShares() != null ? request.treasuryShares() : 0L;
        long res = request.reservedShares() != null ? request.reservedShares() : 0L;
        long iss = request.issuedShares() != null ? request.issuedShares() : (out + tr);

        if (auth <= 0) errors.put("authorizedShares", "Authorized shares must be positive.");
        if (out <= 0) errors.put("outstandingShares", "Outstanding shares must be positive.");
        if (tr < 0) errors.put("treasuryShares", "Treasury shares cannot be negative.");
        if (res < 0) errors.put("reservedShares", "Reserved shares cannot be negative.");
        if (iss != (out + tr)) errors.put("issuedShares", "Issued shares must equal outstanding plus treasury shares.");
        if (auth < (iss + res)) errors.put("authorizedShares", "Authorized shares must be at least issued plus reserved shares.");
        if (request.parValue() != null && request.parValue().signum() <= 0) errors.put("parValue", "Par value must be positive.");
        if (!errors.isEmpty()) throw new AuthException("INVALID_REQUEST", "Review the highlighted fields.", 400, errors);
    }

    public StartupProfile submit(long userId) {
        StartupProfile profile = repository.findByUserId(userId)
                .orElseThrow(() -> new AuthException("PROFILE_REQUIRED", "Save your company profile before submitting it.", 400));
        StartupProfileRequest request = new StartupProfileRequest(
                profile.companyName(), profile.tagline(), profile.description(), profile.website(), profile.sector(),
                profile.headquarters(), profile.foundedYear(), profile.stage().name(), profile.teamSize(), profile.pitchUrl(),
                profile.metrics()
        );
        validateProfile(request, profile.stage(), true);
        repository.saveProfile(
                userId,
                request,
                profile.stage(),
                ReviewStatus.SUBMITTED,
                StartupVisibility.PRIVATE,
                null,
                Instant.now(),
                null
        );
        repository.addReviewAction(profile.id(), userId, "SUBMITTED", null);
        return repository.findByUserId(userId).orElseThrow(() -> new IllegalStateException("Submitted startup profile was not returned"));
    }

    public StartupDocument addDocument(long userId, DocumentRequest request) {
        StartupProfile profile = requireProfile(userId);
        DocumentKind kind = parseDocumentKind(request.kind());
        Map<String, String> errors = new LinkedHashMap<>();
        if (blank(request.title())) errors.put("title", "Give the document a name.");
        if (!isHttpUrl(request.resourceUrl())) errors.put("resourceUrl", "Use a valid http or https URL.");
        if (!errors.isEmpty()) throw invalidRequest(errors);
        return repository.addDocument(profile.id(), kind, request.title(), request.resourceUrl());
    }

    public void deleteDocument(long userId, long documentId) {
        if (!repository.deleteDocument(documentId, userId)) {
            throw new AuthException("DOCUMENT_NOT_FOUND", "That document is not part of your startup profile.", 404);
        }
    }

    public List<StartupProfile> reviewQueue() {
        return repository.findReviewQueue();
    }

    public StartupProfile review(long adminUserId, long profileId, ReviewRequest request) {
        StartupProfile profile = repository.findById(profileId)
                .orElseThrow(() -> new AuthException("PROFILE_NOT_FOUND", "The startup profile could not be found.", 404));
        ReviewStatus status = parseReviewAction(request.action());
        if (status == ReviewStatus.APPROVED && profile.reviewStatus() == ReviewStatus.DRAFT) {
            throw new AuthException("INVALID_REVIEW", "Only submitted profiles can be approved.", 400);
        }
        StartupVisibility visibility = status == ReviewStatus.APPROVED ? profile.visibility() : StartupVisibility.PRIVATE;
        repository.updateReviewState(profileId, status, visibility, request.note(), Instant.now());
        repository.addReviewAction(profileId, adminUserId, status.name(), request.note());
        return repository.findById(profileId).orElseThrow(() -> new IllegalStateException("Reviewed profile was not returned"));
    }

    public StartupProfile updateVisibility(long adminUserId, long profileId, VisibilityRequest request) {
        StartupProfile profile = repository.findById(profileId)
                .orElseThrow(() -> new AuthException("PROFILE_NOT_FOUND", "The startup profile could not be found.", 404));
        StartupVisibility visibility = parseVisibility(request.visibility());
        if (visibility == StartupVisibility.PUBLIC && profile.reviewStatus() != ReviewStatus.APPROVED) {
            throw new AuthException("INVALID_VISIBILITY", "Only approved startup profiles can be made public.", 400);
        }
        repository.updateVisibility(profileId, visibility);
        repository.addReviewAction(
                profileId,
                adminUserId,
                visibility == StartupVisibility.PUBLIC ? "MADE_PUBLIC" : "MADE_PRIVATE",
                null
        );
        return repository.findById(profileId).orElseThrow(() -> new IllegalStateException("Visibility update was not returned"));
    }

    public List<StartupProfile> publicProfiles() {
        return repository.findPublicProfiles();
    }

    private StartupProfile requireProfile(long userId) {
        return repository.findByUserId(userId)
                .orElseThrow(() -> new AuthException("PROFILE_REQUIRED", "Save your company profile first.", 400));
    }

    private void validateProfile(StartupProfileRequest request, StartupStage stage, boolean forSubmission) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (blank(request.companyName()) || request.companyName().trim().length() < 2) errors.put("companyName", "Enter your company name.");
        if (blank(request.tagline())) errors.put("tagline", "Add a short one-line description.");
        if (blank(request.description()) || request.description().trim().length() < 40) errors.put("description", "Use at least 40 characters so reviewers have useful context.");
        if (blank(request.sector())) errors.put("sector", "Choose the sector your company operates in.");
        if (request.foundedYear() != null && (request.foundedYear() < 1900 || request.foundedYear() > 2100)) errors.put("foundedYear", "Use a four-digit year.");
        if (request.teamSize() != null && request.teamSize() < 1) errors.put("teamSize", "Team size must be at least 1.");
        if (!blank(request.website()) && !isHttpUrl(request.website())) errors.put("website", "Use a valid http or https URL.");
        if (!blank(request.pitchUrl()) && !isHttpUrl(request.pitchUrl())) errors.put("pitchUrl", "Use a valid http or https URL.");

        Map<String, BigDecimal> metrics = request.metrics() == null ? Map.of() : request.metrics();
        for (String key : REQUIRED_METRICS.get(stage)) {
            BigDecimal value = metrics.get(key);
            if (value == null) {
                errors.put("metrics." + key, "Add this metric for the selected company stage.");
            } else if (value.signum() < 0) {
                errors.put("metrics." + key, "Metrics cannot be negative.");
            }
        }
        if (forSubmission && blank(request.pitchUrl())) {
            errors.put("pitchUrl", "Add a pitch link before submitting.");
        }
        if (!errors.isEmpty()) throw invalidRequest(errors);
    }

    private StartupStage parseStage(String rawStage) {
        try {
            return StartupStage.valueOf(rawStage == null ? "" : rawStage.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw invalidRequest(Map.of("stage", "Choose a supported company stage."));
        }
    }

    private DocumentKind parseDocumentKind(String rawKind) {
        try {
            return DocumentKind.valueOf(rawKind == null ? "" : rawKind.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw invalidRequest(Map.of("kind", "Choose a supported document type."));
        }
    }

    private ReviewStatus parseReviewAction(String rawAction) {
        try {
            ReviewStatus status = ReviewStatus.valueOf(rawAction == null ? "" : rawAction.trim().toUpperCase());
            if (status == ReviewStatus.DRAFT || status == ReviewStatus.SUBMITTED) {
                throw new IllegalArgumentException();
            }
            return status;
        } catch (IllegalArgumentException exception) {
            throw invalidRequest(Map.of("action", "Choose approve, request changes, or reject."));
        }
    }

    private StartupVisibility parseVisibility(String rawVisibility) {
        try {
            return StartupVisibility.valueOf(rawVisibility == null ? "" : rawVisibility.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw invalidRequest(Map.of("visibility", "Choose public or private."));
        }
    }

    private static AuthException invalidRequest(Map<String, String> errors) {
        return new AuthException("INVALID_REQUEST", "Review the highlighted fields.", 400, errors);
    }

    private static boolean blank(String value) {
        return value == null || value.trim().isBlank();
    }

    private static boolean isHttpUrl(String value) {
        if (blank(value)) return false;
        try {
            URI uri = URI.create(value.trim());
            return "http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme());
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}
