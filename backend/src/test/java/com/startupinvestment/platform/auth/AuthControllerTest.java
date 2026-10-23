package com.startupinvestment.platform.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registrationLoginMeAndLogoutUseTheSameSession() throws Exception {
        String email = "founder-" + UUID.randomUUID() + "@example.com";
        String password = "founder-password-123";
        MockHttpSession session = new MockHttpSession();
        String csrf = csrfToken(session);

        mockMvc.perform(post("/api/v1/auth/register")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrf)
                        .contentType("application/json")
                        .content("{\"email\":\" " + email + " \",\"password\":\"" + password + "\",\"role\":\"STARTUP\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("STARTUP"))
                .andExpect(jsonPath("$.password").doesNotExist());

        mockMvc.perform(get("/api/v1/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));

        mockMvc.perform(post("/api/v1/auth/logout")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrf))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/me").session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));

        MockHttpSession loginSession = new MockHttpSession();
        String loginCsrf = csrfToken(loginSession);
        mockMvc.perform(post("/api/v1/auth/login")
                        .session(loginSession)
                        .header(CsrfService.HEADER_NAME, loginCsrf)
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void publicRegistrationCannotCreateAnAdmin() throws Exception {
        MockHttpSession session = new MockHttpSession();
        String csrf = csrfToken(session);

        mockMvc.perform(post("/api/v1/auth/register")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrf)
                        .contentType("application/json")
                        .content("{\"email\":\"not-admin@example.com\",\"password\":\"admin-password-123\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.fieldErrors.role").exists());
    }

    @Test
    void roleAccessIsEnforcedByTheBackend() throws Exception {
        MockHttpSession session = new MockHttpSession();
        String csrf = csrfToken(session);
        String email = "investor-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/api/v1/auth/register")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrf)
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"investor-password-123\",\"role\":\"INVESTOR\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/investor/access").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access").value("granted"));

        mockMvc.perform(get("/api/v1/admin/access").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void unsafeRequestsWithoutCsrfAreRejected() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"user@example.com\",\"password\":\"password-123456\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("CSRF_INVALID"));
    }

    private String csrfToken(MockHttpSession session) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/auth/csrf").session(session))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        return body.get("token").asText();
    }
}
