package com.startupinvestment.platform.portfolio;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

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
class PortfolioWorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void investorPortfolioAllocatesQuantsAndExplainsIllustrativeValueFromLatestSnapshot() throws Exception {
        MockHttpSession startupSession = register("portfolio-startup-" + UUID.randomUUID() + "@example.com", "startup-password-123", "STARTUP");
        String profile = """
                {
                  "companyName":"Atlas Commerce",
                  "tagline":"Infrastructure for independent commerce",
                  "description":"Atlas gives independent commerce teams the infrastructure they need to coordinate inventory, orders, and customer relationships.",
                  "website":"https://atlas.example.com",
                  "sector":"Commerce infrastructure",
                  "headquarters":"Mumbai, India",
                  "foundedYear":2023,
                  "stage":"EARLY_REVENUE",
                  "teamSize":12,
                  "pitchUrl":"https://atlas.example.com/pitch",
                  "metrics":{"monthly_revenue":150000,"monthly_growth_percent":20,"active_users":300}
                }
                """;
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

        String adminEmail = "portfolio-admin-" + UUID.randomUUID() + "@example.com";
        userRepository.insert(adminEmail, passwordEncoder.encode("admin-password-123"), UserRole.ADMIN);
        MockHttpSession adminSession = login(adminEmail, "admin-password-123");
        approveAndPublish(adminSession, profileId);

        mockMvc.perform(put("/api/v1/startup/fundraising/pool")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession))
                        .contentType("application/json")
                        .content("{\"title\":\"Seed round\",\"targetAmount\":1000000,\"minCommitment\":25000,\"maxCommitment\":250000,\"valuationCap\":10000000,\"endsAt\":\"2027-12-31T00:00:00Z\"}"))
                .andExpect(status().isOk());
        MvcResult opened = mockMvc.perform(post("/api/v1/startup/fundraising/pool/open")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession)))
                .andExpect(status().isOk())
                .andReturn();
        long poolId = objectMapper.readTree(opened.getResponse().getContentAsString(StandardCharsets.UTF_8)).get("id").asLong();

        MockHttpSession investorSession = register("portfolio-investor-" + UUID.randomUUID() + "@example.com", "investor-password-123", "INVESTOR");
        mockMvc.perform(post("/api/v1/investor/fundraising/pools/" + poolId + "/commit")
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"amount\":50000}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/admin/valuations")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"profileId\":" + profileId + ",\"valuationAmount\":12000000,\"snapshotAt\":\"2026-10-24T00:00:00Z\",\"note\":\"Illustrative October snapshot\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Atlas Commerce"));

        mockMvc.perform(get("/api/v1/investor/portfolio").session(investorSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCommitted").value(50000))
                .andExpect(jsonPath("$.totalQuants").value(50))
                .andExpect(jsonPath("$.valuedAmount").value(60000))
                .andExpect(jsonPath("$.illustrativeGain").value(10000))
                .andExpect(jsonPath("$.positions[0].quants").value(50))
                .andExpect(jsonPath("$.positions[0].currentValue").value(60000))
                .andExpect(jsonPath("$.positions[0].illustrativeGain").value(10000));

        mockMvc.perform(get("/api/v1/admin/valuations").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].valuationAmount").value(12000000));
    }

    private void approveAndPublish(MockHttpSession adminSession, long profileId) throws Exception {
        mockMvc.perform(patch("/api/v1/admin/startups/" + profileId + "/review")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"action\":\"APPROVED\",\"note\":\"Approved for portfolio simulation.\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/v1/admin/startups/" + profileId + "/visibility")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"visibility\":\"PUBLIC\"}"))
                .andExpect(status().isOk());
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
