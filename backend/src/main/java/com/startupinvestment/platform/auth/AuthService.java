package com.startupinvestment.platform.auth;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final int MIN_PASSWORD_LENGTH = 12;

    private final AuthUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AppUser register(String rawEmail, String rawPassword, String rawRole) {
        String email = normalizeEmail(rawEmail);
        String password = rawPassword == null ? "" : rawPassword;
        UserRole role = parseRole(rawRole);
        validateRegistration(email, password, role);

        if (userRepository.existsByEmail(email)) {
            throw new AuthException("EMAIL_IN_USE", "An account with this email already exists.", 409);
        }

        try {
            userRepository.insert(email, passwordEncoder.encode(password), role);
        } catch (DataIntegrityViolationException exception) {
            throw new AuthException("EMAIL_IN_USE", "An account with this email already exists.", 409);
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Registered user was not returned by the database"));
    }

    public AppUser authenticate(String rawEmail, String rawPassword) {
        String email = normalizeEmail(rawEmail);
        String password = rawPassword == null ? "" : rawPassword;
        Optional<AppUser> user = userRepository.findByEmail(email);

        if (user.isEmpty() || !user.get().enabled()) {
            throw invalidCredentials();
        }

        String passwordHash = userRepository.findPasswordHashByEmail(email)
                .orElseThrow(AuthService::invalidCredentials);

        if (!passwordEncoder.matches(password, passwordHash)) {
            throw invalidCredentials();
        }

        return user.get();
    }

    public String normalizeEmail(String rawEmail) {
        return rawEmail == null ? "" : rawEmail.trim().toLowerCase(Locale.ROOT);
    }

    public AppUser requireEnabledUser(long id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("UNAUTHENTICATED", "Authentication required.", 401));
        if (!user.enabled()) {
            throw new AuthException("UNAUTHENTICATED", "Authentication required.", 401);
        }
        return user;
    }

    private void validateRegistration(String email, String password, UserRole role) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        if (email.isBlank() || !EMAIL_PATTERN.matcher(email).matches()) {
            fieldErrors.put("email", "Enter a valid email address.");
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            fieldErrors.put("password", "Use at least 12 characters.");
        }
        if (role == UserRole.ADMIN) {
            fieldErrors.put("role", "Administrator accounts cannot be created through public registration.");
        }
        if (!fieldErrors.isEmpty()) {
            throw new AuthException("INVALID_REQUEST", "Review the highlighted fields.", 400, fieldErrors);
        }
    }

    private UserRole parseRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            throw new AuthException("INVALID_REQUEST", "Choose an account type.", 400,
                    Map.of("role", "Choose Startup or Investor."));
        }
        try {
            return UserRole.valueOf(rawRole.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new AuthException("INVALID_REQUEST", "Choose a supported account type.", 400,
                    Map.of("role", "Choose Startup or Investor."));
        }
    }

    private static AuthException invalidCredentials() {
        return new AuthException("INVALID_CREDENTIALS", "Email or password is incorrect.", 401);
    }
}
