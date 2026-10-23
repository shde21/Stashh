package com.startupinvestment.platform.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
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
import org.springframework.test.web.servlet.ResultActions;

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

    @Autowired
    private AuthUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    void duplicateNormalizedEmailIsRejected() throws Exception {
        String email = "duplicate-" + UUID.randomUUID() + "@example.com";
        registerUser(" " + email.toUpperCase(Locale.ROOT) + " ", "duplicate-password-123", "STARTUP");

        MockHttpSession duplicateSession = new MockHttpSession();
        String duplicateCsrf = csrfToken(duplicateSession);
        mockMvc.perform(post("/api/v1/auth/register")
                        .session(duplicateSession)
                        .header(CsrfService.HEADER_NAME, duplicateCsrf)
                        .contentType("application/json")
                        .content("{\"email\":\" " + email + " \",\"password\":\"duplicate-password-123\",\"role\":\"INVESTOR\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_IN_USE"));
    }

    @Test
    void invalidCredentialsUseTheSameResponseForUnknownAndExistingEmails() throws Exception {
        String email = "credentials-" + UUID.randomUUID() + "@example.com";
        registerUser(email, "credentials-password-123", "STARTUP");

        loginWithCredentials(email, "wrong-password-123456")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message").value("Email or password is incorrect."));

        loginWithCredentials("missing-" + UUID.randomUUID() + "@example.com", "wrong-password-123456")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message").value("Email or password is incorrect."));
    }

    @Test
    void roleAccessIsEnforcedForStartupInvestorAndAdmin() throws Exception {
        MockHttpSession startupSession = registerUser(
                "startup-" + UUID.randomUUID() + "@example.com", "startup-password-123", "STARTUP");
        assertGranted(startupSession, "/api/v1/startup/access", "startup");
        assertForbidden(startupSession, "/api/v1/investor/access");
        assertForbidden(startupSession, "/api/v1/admin/access");

        MockHttpSession investorSession = registerUser(
                "investor-" + UUID.randomUUID() + "@example.com", "investor-password-123", "INVESTOR");
        assertForbidden(investorSession, "/api/v1/startup/access");
        assertGranted(investorSession, "/api/v1/investor/access", "investor");
        assertForbidden(investorSession, "/api/v1/admin/access");

        String adminEmail = "admin-" + UUID.randomUUID() + "@example.com";
        String adminPassword = "admin-password-123";
        userRepository.insert(adminEmail, passwordEncoder.encode(adminPassword), UserRole.ADMIN);
        MockHttpSession adminSession = loginUser(adminEmail, adminPassword);
        assertForbidden(adminSession, "/api/v1/startup/access");
        assertForbidden(adminSession, "/api/v1/investor/access");
        assertGranted(adminSession, "/api/v1/admin/access", "admin");
    }

    @Test
    void unsafeRequestsWithoutCsrfAreRejected() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"user@example.com\",\"password\":\"password-123456\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("CSRF_INVALID"));
    }

    @Test
    void logoutRequiresCsrfAndInvalidatesTheAuthenticatedSession() throws Exception {
        MockHttpSession session = registerUser(
                "logout-" + UUID.randomUUID() + "@example.com", "logout-password-123", "STARTUP");

        mockMvc.perform(post("/api/v1/auth/logout").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("CSRF_INVALID"));

        mockMvc.perform(get("/api/v1/me").session(session))
                .andExpect(status().isOk());

        String csrf = csrfToken(session);
        mockMvc.perform(post("/api/v1/auth/logout")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrf))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/me").session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    private MockHttpSession registerUser(String email, String password, String role) throws Exception {
        MockHttpSession session = new MockHttpSession();
        String csrf = csrfToken(session);
        mockMvc.perform(post("/api/v1/auth/register")
                        .session(session)
                        .header(CsrfService.HEADER_NAME, csrf)
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password
                                + "\",\"role\":\"" + role + "\"}"))
                .andExpect(status().isCreated());
        return session;
    }

    private MockHttpSession loginUser(String email, String password) throws Exception {
        MockHttpSession session = new MockHttpSession();
        loginWithCredentials(email, password, session)
                .andExpect(status().isOk());
        return session;
    }

    private ResultActions loginWithCredentials(String email, String password) throws Exception {
        return loginWithCredentials(email, password, new MockHttpSession());
    }

    private ResultActions loginWithCredentials(String email, String password, MockHttpSession session) throws Exception {
        String csrf = csrfToken(session);
        return mockMvc.perform(post("/api/v1/auth/login")
                .session(session)
                .header(CsrfService.HEADER_NAME, csrf)
                .contentType("application/json")
                .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"));
    }

    private void assertGranted(MockHttpSession session, String path, String area) throws Exception {
        mockMvc.perform(get(path).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.area").value(area))
                .andExpect(jsonPath("$.access").value("granted"));
    }

    private void assertForbidden(MockHttpSession session, String path) throws Exception {
        mockMvc.perform(get(path).session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    private String csrfToken(MockHttpSession session) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/auth/csrf").session(session))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        return body.get("token").asText();
    }
}
