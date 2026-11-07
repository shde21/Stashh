package com.startupinvestment.platform.platform;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.startupinvestment.platform.startup.StartupProfile;
import com.startupinvestment.platform.startup.StartupService;

@RestController
@RequestMapping("/api/v1/platform")
public class PlatformStatusController {

    private final PlatformStatusService platformStatusService;
    private final StartupService startupService;

    public PlatformStatusController(PlatformStatusService platformStatusService, StartupService startupService) {
        this.platformStatusService = platformStatusService;
        this.startupService = startupService;
    }

    @GetMapping
    public PlatformStatus getPlatformStatus() {
        return platformStatusService.getStatus();
    }

    @GetMapping("/startups")
    public List<StartupProfile> getPublicStartups() {
        return startupService.publicProfiles();
    }
}
