package com.personalwiki.service;

import lombok.RequiredArgsConstructor;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecuritySetupService {

    private final StringEncryptor encryptor;

    @Value("${piki.security.configured}")
    private String configured;

    @Value("${piki.security.password}")
    private String currentPassword;

    @Value("${piki.security.recovery-key}")
    private String currentRecoveryKey;

    private static final String PROPERTIES_FILE = "./application.properties";

    // ── State ─────────────────────────────────────────────────────────────────

    public boolean isConfigured() {
        return "true".equals(configured);
    }

    public boolean checkPassword(String password) {
        return currentPassword.equals(password);
    }

    public boolean checkRecoveryKey(String key) {
        return currentRecoveryKey.equals(key);
    }

    // ── Initial setup  ────────────────────────────────────────────────────────

    /**
     * Configures the password and generates a backup key.
     * Writes the encrypted values to application.properties.
     * @return the backup key in plain text (to be displayed only once)
     */
    public String setup(String password) throws IOException {
        String recoveryKey = generateRecoveryKey();

        String encryptedPassword = "ENC(" + encryptor.encrypt(password) + ")";
        String encryptedRecoveryKey = "ENC(" + encryptor.encrypt(recoveryKey) + ")";

        updateProperties(encryptedPassword, encryptedRecoveryKey, "true");

        // Update values in memory
        this.currentPassword = password;
        this.currentRecoveryKey = recoveryKey;
        this.configured = "true";

        return recoveryKey;
    }

    // ── Reset password ───────────────────────────────────────────────────

    /**
     * Resets the password with the backup key.
     * Generates a new backup key.
     * @return the new backup key in plain text
     */
    public String resetPassword(String newPassword) throws IOException {
        String newRecoveryKey = generateRecoveryKey();

        String encryptedPassword = "ENC(" + encryptor.encrypt(newPassword) + ")";
        String encryptedRecoveryKey = "ENC(" + encryptor.encrypt(newRecoveryKey) + ")";

        updateProperties(encryptedPassword, encryptedRecoveryKey, "true");

        this.currentPassword = newPassword;
        this.currentRecoveryKey = newRecoveryKey;

        return newRecoveryKey;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String generateRecoveryKey() {
        String uuid = UUID.randomUUID().toString().toUpperCase().replace("-", "");
        return "PIKI-" + uuid.substring(0, 4) + "-" + uuid.substring(4, 8)
                + "-" + uuid.substring(8, 12) + "-" + uuid.substring(12, 16);
    }

    private void updateProperties(String encPassword, String encRecoveryKey,
                                  String configuredValue) throws IOException {
        Properties props = new Properties();

        // Read the existing file
        try (FileInputStream fis = new FileInputStream(PROPERTIES_FILE)) {
            props.load(fis);
        }

        // Update values
        props.setProperty("piki.security.password", encPassword);
        props.setProperty("piki.security.recovery-key", encRecoveryKey);
        props.setProperty("piki.security.configured", configuredValue);

        // Write
        try (FileOutputStream fos = new FileOutputStream(PROPERTIES_FILE)) {
            props.store(fos, "Piki Security Configuration — do not edit manually");
        }
    }
}
