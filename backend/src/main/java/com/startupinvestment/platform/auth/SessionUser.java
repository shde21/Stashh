package com.startupinvestment.platform.auth;

import java.io.Serial;
import java.io.Serializable;

public record SessionUser(
        long id,
        String email,
        UserRole role
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    public static SessionUser from(AppUser user) {
        return new SessionUser(user.id(), user.email(), user.role());
    }

    public AuthUserResponse response() {
        return new AuthUserResponse(id, email, role);
    }
}
