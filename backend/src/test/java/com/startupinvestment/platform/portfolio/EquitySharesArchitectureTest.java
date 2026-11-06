package com.startupinvestment.platform.portfolio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.startupinvestment.platform.auth.AuthUserRepository;
import com.startupinvestment.platform.auth.CsrfService;
import com.startupinvestment.platform.auth.UserRole;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EquitySharesArchitectureTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Verify requirements A, B, C, D, E, F, G, H, I, J for company-specific shares architecture")
    void testCompanySpecificEquitySharesArchitecture() throws Exception {
        // Setup Admin
        String adminEmail = "admin-" + UUID.randomUUID() + "@example.com";
        userRepository.insert(adminEmail, passwordEncoder.encode("admin-password-123"), UserRole.ADMIN);
        MockHttpSession adminSession = login(adminEmail, "admin-password-123");

        // Company 1: Alpha Tech (Outstanding shares: 1,000,000, Round Price per Share: ₹10)
        MockHttpSession alphaSession = register("alpha-" + UUID.randomUUID() + "@example.com", "password-123", "STARTUP");
        long alphaProfileId = createAndPublishStartup(alphaSession, adminSession, "Alpha Tech", 10000000L, 1000000L);
        long alphaPoolId = createAndOpenRound(alphaSession, "Alpha Seed", 1000000.0, 10.0, 100000L);

        // Company 2: Beta Health (Outstanding shares: 500,000, Round Price per Share: ₹50)
        MockHttpSession betaSession = register("beta-" + UUID.randomUUID() + "@example.com", "password-123", "STARTUP");
        long betaProfileId = createAndPublishStartup(betaSession, adminSession, "Beta Health", 5000000L, 500000L);
        long betaPoolId = createAndOpenRound(betaSession, "Beta Series A", 1000000.0, 50.0, 20000L);

        // Setup Investor
        MockHttpSession investorSession = register("investor-" + UUID.randomUUID() + "@example.com", "password-123", "INVESTOR");

        // --- REQUIREMENT A: Two companies can have different share prices ---
        MvcResult poolAlphaRes = mockMvc.perform(get("/api/v1/investor/fundraising/pools").session(investorSession))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode pools = objectMapper.readTree(poolAlphaRes.getResponse().getContentAsString(StandardCharsets.UTF_8));
        double alphaPrice = 0.0, betaPrice = 0.0;
        for (JsonNode p : pools) {
            if (p.get("companyName").asText().equals("Alpha Tech")) alphaPrice = p.get("pricePerShare").asDouble();
            if (p.get("companyName").asText().equals("Beta Health")) betaPrice = p.get("pricePerShare").asDouble();
        }
        assertEquals(10.0, alphaPrice, 0.001, "Alpha Tech price per share must be ₹10");
        assertEquals(50.0, betaPrice, 0.001, "Beta Health price per share must be ₹50");
        assertNotEquals(alphaPrice, betaPrice, "Requirement A: Two companies have different share prices");

        // --- REQUIREMENT H: Fractional-share handling (amount not dividing into whole shares is rejected) ---
        mockMvc.perform(post("/api/v1/investor/fundraising/pools/" + betaPoolId + "/commit")
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"amount\":10025}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("FRACTIONAL_SHARES_NOT_ALLOWED"));

        // --- REQUIREMENT B: ₹10,000 commitment at ₹10 per share results in 1,000 shares ---
        MvcResult alphaCommitRes = mockMvc.perform(post("/api/v1/investor/fundraising/pools/" + alphaPoolId + "/commit")
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"amount\":10000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sharesAllocated").value(1000))
                .andExpect(jsonPath("$.pricePerShare").value(10.0))
                .andReturn();
        JsonNode alphaCommit = objectMapper.readTree(alphaCommitRes.getResponse().getContentAsString(StandardCharsets.UTF_8));
        assertEquals(1000, alphaCommit.get("sharesAllocated").asLong(), "Requirement B: 10,000 / 10 = 1,000 shares");

        // --- REQUIREMENT C: ₹10,000 commitment at ₹50 per share results in 200 shares ---
        MvcResult betaCommitRes = mockMvc.perform(post("/api/v1/investor/fundraising/pools/" + betaPoolId + "/commit")
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"amount\":10000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sharesAllocated").value(200))
                .andExpect(jsonPath("$.pricePerShare").value(50.0))
                .andReturn();
        JsonNode betaCommit = objectMapper.readTree(betaCommitRes.getResponse().getContentAsString(StandardCharsets.UTF_8));
        assertEquals(200, betaCommit.get("sharesAllocated").asLong(), "Requirement C: 10,000 / 50 = 200 shares");

        // --- REQUIREMENT D: Investor ownership percentages calculated using company capitalization ---
        MvcResult portfolioRes = mockMvc.perform(get("/api/v1/investor/portfolio").session(investorSession))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode portfolio = objectMapper.readTree(portfolioRes.getResponse().getContentAsString(StandardCharsets.UTF_8));
        JsonNode positions = portfolio.get("positions");

        JsonNode alphaPos = null, betaPos = null;
        for (JsonNode pos : positions) {
            if (pos.get("companyName").asText().equals("Alpha Tech")) alphaPos = pos;
            if (pos.get("companyName").asText().equals("Beta Health")) betaPos = pos;
        }
        assertNotNull(alphaPos);
        assertNotNull(betaPos);

        // Alpha: 1,000 shares / (1,000,000 base + 1,000 round allocated) = 1000 / 1001000 * 100 = ~0.0999%
        double alphaOwnership = alphaPos.get("ownershipPercentage").asDouble();
        assertTrue(alphaOwnership > 0.09 && alphaOwnership <= 0.10, "Requirement D: Alpha ownership calculated from capitalization");

        // Beta: 200 shares / (500,000 base + 200 round allocated) = 200 / 500200 * 100 = ~0.0400%
        double betaOwnership = betaPos.get("ownershipPercentage").asDouble();
        assertTrue(betaOwnership > 0.038 && betaOwnership <= 0.041, "Requirement D: Beta ownership calculated from capitalization");

        // --- REQUIREMENT E: New share issuance changes ownership percentages without changing historical share counts ---
        // Second investor commits 4,000 shares (₹40,000) to Alpha Tech, diluting total shares
        MockHttpSession secondInvestor = register("investor2-" + UUID.randomUUID() + "@example.com", "password-123", "INVESTOR");
        mockMvc.perform(post("/api/v1/investor/fundraising/pools/" + alphaPoolId + "/commit")
                        .session(secondInvestor)
                        .header(CsrfService.HEADER_NAME, csrfToken(secondInvestor))
                        .contentType("application/json")
                        .content("{\"amount\":40000}"))
                .andExpect(status().isOk());

        // First investor's portfolio check
        MvcResult portfolioAfterDilutionRes = mockMvc.perform(get("/api/v1/investor/portfolio").session(investorSession))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode posAfterDilution = objectMapper.readTree(portfolioAfterDilutionRes.getResponse().getContentAsString(StandardCharsets.UTF_8)).get("positions");
        JsonNode alphaPosAfter = null;
        for (JsonNode pos : posAfterDilution) {
            if (pos.get("companyName").asText().equals("Alpha Tech")) alphaPosAfter = pos;
        }
        assertNotNull(alphaPosAfter);
        assertEquals(1000, alphaPosAfter.get("shares").asLong(), "Requirement E: Share count remains exactly 1,000 shares");
        double dilutedOwnership = alphaPosAfter.get("ownershipPercentage").asDouble();
        assertTrue(dilutedOwnership < alphaOwnership, "Requirement E: Ownership percentage is diluted when more shares are issued");

        // --- REQUIREMENT F: Updating valuation does not rewrite historical acquisition prices or share allocations ---
        mockMvc.perform(post("/api/v1/admin/valuations")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"profileId\":" + alphaProfileId + ",\"valuationAmount\":20000000,\"snapshotAt\":\"2026-10-25T00:00:00Z\",\"note\":\"Growth update\"}"))
                .andExpect(status().isOk());

        MvcResult portfolioAfterValuation = mockMvc.perform(get("/api/v1/investor/portfolio").session(investorSession))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode posAfterVal = objectMapper.readTree(portfolioAfterValuation.getResponse().getContentAsString(StandardCharsets.UTF_8)).get("positions");
        JsonNode alphaPosVal = null;
        for (JsonNode pos : posAfterVal) {
            if (pos.get("companyName").asText().equals("Alpha Tech")) alphaPosVal = pos;
        }
        assertNotNull(alphaPosVal);
        assertEquals(1000, alphaPosVal.get("shares").asLong(), "Requirement F: Shares allocated remains exactly 1,000");
        assertEquals(10.0, alphaPosVal.get("acquisitionPricePerShare").asDouble(), 0.001, "Requirement F: Historical acquisition price remains ₹10");
        assertEquals(20.0, alphaPosVal.get("latestSharePrice").asDouble(), 0.001, "Requirement F: Latest price per share reflects valuation / shares = ₹20");
        assertEquals(20000.0, alphaPosVal.get("currentValue").asDouble(), 0.01, "Current value is 1,000 * 20 = ₹20,000");
        assertEquals(10000.0, alphaPosVal.get("illustrativeGain").asDouble(), 0.01, "Gain is 20,000 - 10,000 = ₹10,000");

        // --- REQUIREMENT G: No fundraising round can allocate more shares than it has available ---
        // Alpha round offered 100,000 shares. Currently allocated: 1,000 + 4,000 = 5,000 shares. Remaining = 95,000 shares.
        // Trying to commit 96,000 shares (₹960,000) when target / remaining is exceeded:
        MockHttpSession thirdInvestor = register("investor3-" + UUID.randomUUID() + "@example.com", "password-123", "INVESTOR");
        mockMvc.perform(post("/api/v1/investor/fundraising/pools/" + alphaPoolId + "/commit")
                        .session(thirdInvestor)
                        .header(CsrfService.HEADER_NAME, csrfToken(thirdInvestor))
                        .contentType("application/json")
                        .content("{\"amount\":960000}"))
                .andExpect(status().isBadRequest()); // Capacity check triggered

        // --- REQUIREMENT I & J: Multi-company portfolio values holdings independently in INR; shares are NOT added together ---
        JsonNode fullPortfolio = objectMapper.readTree(portfolioAfterValuation.getResponse().getContentAsString(StandardCharsets.UTF_8));
        // Total committed: Alpha (10,000) + Beta (10,000) = 20,000
        assertEquals(20000.0, fullPortfolio.get("totalCommitted").asDouble(), 0.01, "Requirement I: Portfolio committed sum in INR is ₹20,000");
        // Ensure cross-company share sum does not exist
        assertTrue(fullPortfolio.get("totalShares") == null, "Requirement J: Shares across companies are never summed into an interchangeable unit");
        // Verify active positions count is 2
        assertEquals(2, fullPortfolio.get("activeHoldingsCount").asInt(), "Requirement I: 2 active company positions");
    }

    private long createAndPublishStartup(MockHttpSession startupSession, MockHttpSession adminSession, String name, long authorized, long outstanding) throws Exception {
        String profile = String.format("""
                {
                  "companyName":"%s",
                  "tagline":"Leading innovator in industry",
                  "description":"Full description of startup operations and commercial model.",
                  "website":"https://example.com",
                  "sector":"Technology",
                  "headquarters":"Bengaluru, India",
                  "foundedYear":2023,
                  "stage":"EARLY_REVENUE",
                  "teamSize":15,
                  "pitchUrl":"https://example.com/pitch",
                  "metrics":{"monthly_revenue":200000,"monthly_growth_percent":25,"active_users":500}
                }
                """, name);
        mockMvc.perform(put("/api/v1/startup/profile")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession))
                        .contentType("application/json")
                        .content(profile))
                .andExpect(status().isOk());

        MvcResult submit = mockMvc.perform(post("/api/v1/startup/profile/submit")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession)))
                .andExpect(status().isOk())
                .andReturn();
        long profileId = objectMapper.readTree(submit.getResponse().getContentAsString(StandardCharsets.UTF_8)).get("id").asLong();

        // Save capitalization
        String capPayload = String.format("""
                {
                  "authorizedShares": %d,
                  "issuedShares": %d,
                  "outstandingShares": %d,
                  "treasuryShares": 0,
                  "reservedShares": 0,
                  "shareClass": "EQUITY",
                  "parValue": 10.0
                }
                """, authorized, outstanding, outstanding);
        mockMvc.perform(put("/api/v1/startup/capitalization")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession))
                        .contentType("application/json")
                        .content(capPayload))
                .andExpect(status().isOk());

        // Approve and make public
        mockMvc.perform(patch("/api/v1/admin/startups/" + profileId + "/review")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"action\":\"APPROVED\",\"note\":\"Approved for platform.\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/v1/admin/startups/" + profileId + "/visibility")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"visibility\":\"PUBLIC\"}"))
                .andExpect(status().isOk());

        return profileId;
    }

    private long createAndOpenRound(MockHttpSession startupSession, String title, double targetAmount, double pricePerShare, long totalShares) throws Exception {
        String roundPayload = String.format("""
                {
                  "title": "%s",
                  "targetAmount": %.2f,
                  "minCommitment": 1000.0,
                  "maxCommitment": 500000.0,
                  "pricePerShare": %.4f,
                  "totalSharesOffered": %d,
                  "endsAt": "2028-12-31T00:00:00Z"
                }
                """, title, targetAmount, pricePerShare, totalShares);
        mockMvc.perform(put("/api/v1/startup/fundraising/pool")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession))
                        .contentType("application/json")
                        .content(roundPayload))
                .andExpect(status().isOk());

        MvcResult opened = mockMvc.perform(post("/api/v1/startup/fundraising/pool/open")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(opened.getResponse().getContentAsString(StandardCharsets.UTF_8)).get("id").asLong();
    }

    private MockHttpSession register(String email, String password, String role) throws Exception {
        MockHttpSession session = new MockHttpSession();
        mockMvc.perform(post("/api/v1/auth/register")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrfToken(session))
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\",\"role\":\"" + role + "\"}"))
                .andExpect(status().isCreated());
        return session;
    }

    private MockHttpSession login(String email, String password) throws Exception {
        MockHttpSession session = new MockHttpSession();
        mockMvc.perform(post("/api/v1/auth/login")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrfToken(session))
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk());
        return session;
    }

    private String csrfToken(MockHttpSession session) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/auth/csrf").session(session))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        return body.get("token").asText();
    }
}
