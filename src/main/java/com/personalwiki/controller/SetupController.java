package com.personalwiki.controller;

import com.personalwiki.service.SecuritySetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class SetupController {

    private final SecuritySetupService setupService;

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok(Map.of("configured", setupService.isConfigured()));
    }

    @PostMapping("/configure")
    public ResponseEntity<?> configure(@RequestBody Map<String, String> body) {
        if (setupService.isConfigured()) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Application is already configured"));
        }

        String password = body.get("password");
        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 6 characters"));
        }

        try {
            String recoveryKey = setupService.setup(password);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "recoveryKey", recoveryKey
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Setup failed: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-recovery-key")
    public ResponseEntity<?> verifyRecoveryKey(@RequestBody Map<String, String> body) {
        String key = body.get("recoveryKey");
        boolean valid = setupService.checkRecoveryKey(key);
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String recoveryKey = body.get("recoveryKey");
        String newPassword = body.get("newPassword");

        if (!setupService.checkRecoveryKey(recoveryKey)) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid recovery key"));
        }

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 6 characters"));
        }

        try {
            String newRecoveryKey = setupService.resetPassword(newPassword);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "recoveryKey", newRecoveryKey,
                    "message", "Password reset successful. Save your new recovery key."
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Reset failed: " + e.getMessage()));
        }
    }
}
