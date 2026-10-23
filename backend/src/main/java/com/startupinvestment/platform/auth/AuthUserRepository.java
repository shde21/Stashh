package com.startupinvestment.platform.auth;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AuthUserRepository {

    private final JdbcTemplate jdbcTemplate;

    public AuthUserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<AppUser> findByEmail(String email) {
        List<AppUser> users = jdbcTemplate.query(
                "SELECT id, email, role, enabled FROM app_users WHERE email = ?",
                (rs, rowNum) -> new AppUser(
                        rs.getLong("id"),
                        rs.getString("email"),
                        UserRole.valueOf(rs.getString("role")),
                        rs.getBoolean("enabled")
                ),
                email
        );
        return users.stream().findFirst();
    }

    public Optional<AppUser> findById(long id) {
        List<AppUser> users = jdbcTemplate.query(
                "SELECT id, email, role, enabled FROM app_users WHERE id = ?",
                (rs, rowNum) -> new AppUser(
                        rs.getLong("id"),
                        rs.getString("email"),
                        UserRole.valueOf(rs.getString("role")),
                        rs.getBoolean("enabled")
                ),
                id
        );
        return users.stream().findFirst();
    }

    public Optional<String> findPasswordHashByEmail(String email) {
        List<String> hashes = jdbcTemplate.query(
                "SELECT password_hash FROM app_users WHERE email = ?",
                (rs, rowNum) -> rs.getString("password_hash"),
                email
        );
        return hashes.stream().findFirst();
    }

    public boolean existsByEmail(String email) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM app_users WHERE email = ?",
                Long.class,
                email
        );
        return count != null && count > 0;
    }

    public void insert(String email, String passwordHash, UserRole role) {
        jdbcTemplate.update(
                "INSERT INTO app_users (email, password_hash, role) VALUES (?, ?, ?)",
                email,
                passwordHash,
                role.name()
        );
    }
}
