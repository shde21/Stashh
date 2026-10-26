package com.startupinvestment.platform.fundraising;

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
class FundraisingWorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void approvedStartupCanOpenPoolAndInvestorCanCommitBeforeAdminClosesIt() throws Exception {
        MockHttpSession startupSession = register("fundraising-startup-" + UUID.randomUUID() + "@example.com", "startup-password-123", "STARTUP");
        String profile = """
                {
                  "companyName":"Orbit Systems",
                  "tagline":"Workflow automation for distributed operations",
                  "description":"Orbit gives distributed operations teams a shared command center for the work that falls between systems and people.",
                  "website":"https://orbit.example.com",
                  "sector":"Operations software",
                  "headquarters":"Delhi, India",
                  "foundedYear":2024,
                  "stage":"EARLY_REVENUE",
                  "teamSize":9,
                  "pitchUrl":"https://orbit.example.com/pitch",
                  "metrics":{"monthly_revenue":120000,"monthly_growth_percent":18,"active_users":240}
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

        String adminEmail = "fundraising-admin-" + UUID.randomUUID() + "@example.com";
        userRepository.insert(adminEmail, passwordEncoder.encode("admin-password-123"), UserRole.ADMIN);
        MockHttpSession adminSession = login(adminEmail, "admin-password-123");
        reviewAndMakePublic(adminSession, profileId);

        mockMvc.perform(put("/api/v1/startup/fundraising/pool")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession))
                        .contentType("application/json")
                        .content("""
                                {"title":"Seed round","targetAmount":1000000,"minCommitment":25000,"maxCommitment":250000,"valuationCap":10000000,"endsAt":"2027-12-31T00:00:00Z"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"));

        MvcResult opened = mockMvc.perform(post("/api/v1/startup/fundraising/pool/open")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andReturn();
        long poolId = objectMapper.readTree(opened.getResponse().getContentAsString(StandardCharsets.UTF_8)).get("id").asLong();

        MockHttpSession investorSession = register("fundraising-investor-" + UUID.randomUUID() + "@example.com", "investor-password-123", "INVESTOR");
        mockMvc.perform(get("/api/v1/investor/fundraising/pools?stage=EARLY_REVENUE&q=Orbit").session(investorSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("Orbit Systems"))
                .andExpect(jsonPath("$[0].totalCommitted").value(0));

        mockMvc.perform(post("/api/v1/investor/fundraising/pools/" + poolId + "/commit")
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"amount\":50000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(50000));

        mockMvc.perform(get("/api/v1/investor/fundraising/commitments").session(investorSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("Orbit Systems"))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));

        mockMvc.perform(patch("/api/v1/admin/fundraising/pools/" + poolId + "/status")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"status\":\"CLOSED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    private void reviewAndMakePublic(MockHttpSession adminSession, long profileId) throws Exception {
        mockMvc.perform(patch("/api/v1/admin/startups/" + profileId + "/review")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"action\":\"APPROVED\",\"note\":\"Ready for a simulated round.\"}"))
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
        String csrf = csrfToken(session);
        mockMvc.perform(post("/api/v1/auth/register")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrf)
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
