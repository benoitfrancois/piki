package com.personalwiki.controller;

import com.personalwiki.service.SecuritySetupService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AuthController {

    private final SecuritySetupService setupService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body,
                                   HttpServletRequest request) {
        if (!setupService.isConfigured()) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Application not configured", "code", "SETUP_REQUIRED"));
        }

        String password = body.get("password");
        if (setupService.checkPassword(password)) {
            HttpSession session = request.getSession(true);
            session.setAttribute("authenticated", true);
            return ResponseEntity.ok(Map.of("success", true));
        }

        return ResponseEntity.status(401)
                .body(Map.of("error", "Incorrect password"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/check")
    public ResponseEntity<?> check(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        boolean authenticated = session != null
                && Boolean.TRUE.equals(session.getAttribute("authenticated"));
        return ResponseEntity.ok(Map.of(
                "authenticated", authenticated,
                "configured", setupService.isConfigured()
        ));
    }
}
