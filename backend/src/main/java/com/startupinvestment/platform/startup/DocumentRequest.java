package com.startupinvestment.platform.startup;

public record DocumentRequest(
        String kind,
        String title,
        String resourceUrl
) {
}
