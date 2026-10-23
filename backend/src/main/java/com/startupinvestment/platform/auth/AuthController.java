package com.startupinvestment.platform.auth;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthSessionService sessionService;
    private final CsrfService csrfService;

    public AuthController(
            AuthService authService,
            AuthSessionService sessionService,
            CsrfService csrfService
    ) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.csrfService = csrfService;
    }

    @GetMapping("/csrf")
    public CsrfTokenResponse csrf(HttpServletRequest request) {
        return new CsrfTokenResponse(csrfService.token(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthUserResponse> register(
            @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest
    ) {
        AppUser user = authService.register(request.email(), request.password(), request.role());
        SessionUser sessionUser = sessionService.establish(httpRequest, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionUser.response());
    }

    @PostMapping("/login")
    public AuthUserResponse login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        AppUser user = authService.authenticate(request.email(), request.password());
        return sessionService.establish(httpRequest, user).response();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        sessionService.clear(request);
        return ResponseEntity.noContent().build();
    }

    public record RegisterRequest(String email, String password, String role) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record CsrfTokenResponse(String token) {
    }
}
