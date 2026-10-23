package com.startupinvestment.platform.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoAdminSeeder implements ApplicationRunner {

    private final AuthUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String email;
    private final String password;

    public DemoAdminSeeder(
            AuthUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.auth.demo-admin.enabled:false}") boolean enabled,
            @Value("${app.auth.demo-admin.email:admin@ventureline.local}") String email,
            @Value("${app.auth.demo-admin.password:}") String password
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        if (password == null || password.length() < 12) {
            throw new IllegalStateException("DEMO_ADMIN_PASSWORD must contain at least 12 characters when demo admin seeding is enabled");
        }

        String normalizedEmail = email.trim().toLowerCase(java.util.Locale.ROOT);
        if (!userRepository.existsByEmail(normalizedEmail)) {
            userRepository.insert(normalizedEmail, passwordEncoder.encode(password), UserRole.ADMIN);
        }
    }
}
