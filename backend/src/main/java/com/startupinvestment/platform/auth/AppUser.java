package com.startupinvestment.platform.auth;

public record AppUser(
        long id,
        String email,
        UserRole role,
        boolean enabled
) {
}
