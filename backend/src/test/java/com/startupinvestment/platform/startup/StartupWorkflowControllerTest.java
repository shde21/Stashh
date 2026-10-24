package com.startupinvestment.platform.startup;

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
class StartupWorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void startupCanSaveAndSubmitThenAdminCanApproveAndInvestorCanDiscover() throws Exception {
        String startupEmail = "stage3-startup-" + UUID.randomUUID() + "@example.com";
        MockHttpSession startupSession = register(startupEmail, "startup-password-123", "STARTUP");
        String profile = """
                {
                  "companyName":"Northstar Labs",
                  "tagline":"Operating intelligence for small manufacturers",
                  "description":"Northstar helps small manufacturers understand production bottlenecks and act on them before margin disappears.",
                  "website":"https://northstar.example.com",
                  "sector":"Industrial software",
                  "headquarters":"Pune, India",
                  "foundedYear":2024,
                  "stage":"PRE_REVENUE",
                  "teamSize":6,
                  "pitchUrl":"https://northstar.example.com/pitch",
                  "metrics":{"active_users":125,"runway_months":18}
                }
                """;

        mockMvc.perform(put("/api/v1/startup/profile")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession))
                        .contentType("application/json")
                        .content(profile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Northstar Labs"))
                .andExpect(jsonPath("$.reviewStatus").value("DRAFT"))
                .andExpect(jsonPath("$.metrics.active_users").value(125));

        MvcResult submitResult = mockMvc.perform(post("/api/v1/startup/profile/submit")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewStatus").value("SUBMITTED"))
                .andReturn();
        long profileId = objectMapper.readTree(submitResult.getResponse().getContentAsString(StandardCharsets.UTF_8)).get("id").asLong();

        String adminEmail = "stage3-admin-" + UUID.randomUUID() + "@example.com";
        String adminPassword = "admin-password-123";
        userRepository.insert(adminEmail, passwordEncoder.encode(adminPassword), UserRole.ADMIN);
        MockHttpSession adminSession = login(adminEmail, adminPassword);

        mockMvc.perform(get("/api/v1/admin/startups").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("Northstar Labs"));

        mockMvc.perform(patch("/api/v1/admin/startups/" + profileId + "/review")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"action\":\"APPROVED\",\"note\":\"Strong initial context.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewStatus").value("APPROVED"));

        mockMvc.perform(patch("/api/v1/admin/startups/" + profileId + "/visibility")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"visibility\":\"PUBLIC\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.visibility").value("PUBLIC"));

        MockHttpSession investorSession = register(
                "stage3-investor-" + UUID.randomUUID() + "@example.com",
                "investor-password-123",
                "INVESTOR"
        );
        mockMvc.perform(get("/api/v1/investor/startups").session(investorSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("Northstar Labs"))
                .andExpect(jsonPath("$[0].visibility").value("PUBLIC"));
    }

    private MockHttpSession register(String email, String password, String role) throws Exception {
        MockHttpSession session = new MockHttpSession();
        mockMvc.perform(get("/api/v1/auth/csrf").session(session));
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
        String csrf = csrfToken(session);
        mockMvc.perform(post("/api/v1/auth/login")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrf)
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
