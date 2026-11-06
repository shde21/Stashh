package com.startupinvestment.platform.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.stereotype.Service;

@Service
public class AuthSessionService {

    public static final String SESSION_USER_ATTRIBUTE = "stashh.session-user";

    public SessionUser establish(HttpServletRequest request, AppUser user) {
        HttpSession session = request.getSession(true);
        request.changeSessionId();
        SessionUser sessionUser = SessionUser.from(user);
        session.setAttribute(SESSION_USER_ATTRIBUTE, sessionUser);
        return sessionUser;
    }

    public SessionUser current(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            throw unauthenticated();
        }
        Object value = session.getAttribute(SESSION_USER_ATTRIBUTE);
        if (!(value instanceof SessionUser sessionUser)) {
            throw unauthenticated();
        }
        return sessionUser;
    }

    public void clear(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    public void requireRole(HttpServletRequest request, UserRole expectedRole) {
        SessionUser user = current(request);
        if (user.role() != expectedRole) {
            throw new AuthException("FORBIDDEN", "You do not have permission to access this area.", 403);
        }
    }

    private static AuthException unauthenticated() {
        return new AuthException("UNAUTHENTICATED", "Authentication required.", 401);
    }
}
