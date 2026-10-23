package com.startupinvestment.platform.auth;

public record AuthUserResponse(
        long id,
        String email,
        UserRole role
) {
    public static AuthUserResponse from(AppUser user) {
        return new AuthUserResponse(user.id(), user.email(), user.role());
    }
}
