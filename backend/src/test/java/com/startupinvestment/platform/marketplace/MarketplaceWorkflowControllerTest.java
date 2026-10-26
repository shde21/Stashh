package com.startupinvestment.platform.marketplace;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
class MarketplaceWorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void investorCanSavePublicStartupAndSendInterestThatStartupCanRead() throws Exception {
        MockHttpSession startupSession = register("marketplace-startup-" + UUID.randomUUID() + "@example.com", "startup-password-123", "STARTUP");
        String profile = """
                {
                  "companyName":"Signal Works",
                  "tagline":"Data products for overlooked markets",
                  "description":"Signal Works builds data products that help overlooked markets make faster and more confident operating decisions.",
                  "website":"https://signal.example.com",
                  "sector":"Data products",
                  "headquarters":"Hyderabad, India",
                  "foundedYear":2024,
                  "stage":"PRE_REVENUE",
                  "teamSize":5,
                  "pitchUrl":"https://signal.example.com/pitch",
                  "metrics":{"active_users":80,"runway_months":20}
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

        String adminEmail = "marketplace-admin-" + UUID.randomUUID() + "@example.com";
        userRepository.insert(adminEmail, passwordEncoder.encode("admin-password-123"), UserRole.ADMIN);
        MockHttpSession adminSession = login(adminEmail, "admin-password-123");
        mockMvc.perform(patch("/api/v1/admin/startups/" + profileId + "/review")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"action\":\"APPROVED\",\"note\":\"Marketplace ready.\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/v1/admin/startups/" + profileId + "/visibility")
                        .session(adminSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(adminSession))
                        .contentType("application/json")
                        .content("{\"visibility\":\"PUBLIC\"}"))
                .andExpect(status().isOk());

        MockHttpSession investorSession = register("marketplace-investor-" + UUID.randomUUID() + "@example.com", "investor-password-123", "INVESTOR");
        mockMvc.perform(put("/api/v1/investor/marketplace/watchlist/" + profileId)
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"note\":\"Strong data thesis\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/investor/marketplace/watchlist").session(investorSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("Signal Works"))
                .andExpect(jsonPath("$[0].note").value("Strong data thesis"));

        mockMvc.perform(put("/api/v1/investor/marketplace/watchlist/" + profileId)
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"note\":\"Updated data thesis with higher conviction\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/investor/marketplace/watchlist").session(investorSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].note").value("Updated data thesis with higher conviction"));

        mockMvc.perform(post("/api/v1/investor/marketplace/startups/" + profileId + "/interest")
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"message\":\"Would like to learn more about the early customer motion.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));

        mockMvc.perform(get("/api/v1/investor/marketplace/interests").session(investorSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("Signal Works"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        mockMvc.perform(get("/api/v1/startup/marketplace/interests").session(startupSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("Signal Works"))
                .andExpect(jsonPath("$[0].message").value("Would like to learn more about the early customer motion."))
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        mockMvc.perform(delete("/api/v1/investor/marketplace/startups/" + profileId + "/interest")
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("WITHDRAWN"));

        mockMvc.perform(get("/api/v1/startup/marketplace/interests").session(startupSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("WITHDRAWN"));

        mockMvc.perform(delete("/api/v1/investor/marketplace/watchlist/" + profileId)
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession)))
                .andExpect(status().isOk());
    }

    @Test
    void cannotSaveOrContactUnapprovedStartup() throws Exception {
        MockHttpSession startupSession = register("unapproved-startup-" + UUID.randomUUID() + "@example.com", "startup-password-123", "STARTUP");
        String profile = """
                {
                  "companyName":"Stealth Systems",
                  "tagline":"Private robotics",
                  "description":"Stealth Systems is building autonomous automation.",
                  "website":"https://stealth.example.com",
                  "sector":"Robotics",
                  "headquarters":"Pune, India",
                  "foundedYear":2025,
                  "stage":"PRE_REVENUE",
                  "teamSize":3,
                  "pitchUrl":"https://stealth.example.com/pitch",
                  "metrics":{"active_users":10,"runway_months":18}
                }
                """;
        MvcResult saveResult = mockMvc.perform(put("/api/v1/startup/profile")
                        .session(startupSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(startupSession))
                        .contentType("application/json")
                        .content(profile))
                .andExpect(status().isOk())
                .andReturn();
        long profileId = objectMapper.readTree(saveResult.getResponse().getContentAsString(StandardCharsets.UTF_8)).get("id").asLong();

        MockHttpSession investorSession = register("unapproved-investor-" + UUID.randomUUID() + "@example.com", "investor-password-123", "INVESTOR");

        mockMvc.perform(put("/api/v1/investor/marketplace/watchlist/" + profileId)
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"note\":\"Want to save early\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("PROFILE_NOT_PUBLIC"));

        mockMvc.perform(post("/api/v1/investor/marketplace/startups/" + profileId + "/interest")
                        .session(investorSession)
                        .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                        .contentType("application/json")
                        .content("{\"message\":\"Hello stealth\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("PROFILE_NOT_PUBLIC"));
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
