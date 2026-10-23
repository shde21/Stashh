package com.startupinvestment.platform.platform;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlatformStatusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void exposesDatabaseBackedPlatformStatus() throws Exception {
        mockMvc.perform(get("/api/v1/platform"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("startup-investment-platform-api"))
                .andExpect(jsonPath("$.stage").value("foundation"))
                .andExpect(jsonPath("$.database").value("connected"))
                .andExpect(jsonPath("$.migrationVersion").value("1"))
                .andExpect(jsonPath("$.checkedAt").isNotEmpty());
    }

    @Test
    void exposesActuatorHealth() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
