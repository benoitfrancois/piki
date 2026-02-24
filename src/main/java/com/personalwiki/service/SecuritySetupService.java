package com.personalwiki.service;

import lombok.RequiredArgsConstructor;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.util.Properties;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecuritySetupService {

    private final StringEncryptor encryptor;

    private final DataSource dataSource;

    @Value("${piki.security.configured}")
    private String configured;

    @Value("${piki.security.password}")
    private String currentPassword;

    @Value("${piki.security.recovery-key}")
    private String currentRecoveryKey;

    @Value("${piki.config.file:./application.properties}")
    private String propertiesFilePath;

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
     * Writes the encrypted values to application.properties.back.
     * @return the backup key in plain text (to be displayed only once)
     */
    public String setup(String password, String dbPassword) throws Exception {
        // 1. Change password H2
        changeH2Password(dbPassword);

        // 2. Encrypt and back up
        String recoveryKey          = generateRecoveryKey();
        String encryptedPassword    = "ENC(" + encryptor.encrypt(password) + ")";
        String encryptedRecoveryKey = "ENC(" + encryptor.encrypt(recoveryKey) + ")";

        // Format required by H2 CIPHER=AES: "filePassword userPassword"
        String h2FullPassword      = dbPassword + " " + dbPassword;
        String encryptedDbPassword = "ENC(" + encryptor.encrypt(h2FullPassword) + ")";

        updateProperties(encryptedPassword, encryptedRecoveryKey, encryptedDbPassword, "true");

        // 3. Update the values in memory
        this.currentPassword    = password;
        this.currentRecoveryKey = recoveryKey;
        this.configured         = "true";

        // 4. Create the configuration marker
        Files.createDirectories(Paths.get("data"));
        Files.writeString(Paths.get("data/.configured"), "true");

        return recoveryKey;
    }

    private void changeH2Password(String newDbPassword) throws Exception {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER USER SA SET PASSWORD '" + newDbPassword + "'");
        }
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

        Properties current = new Properties();
        try (FileInputStream fis = new FileInputStream(propertiesFilePath)) {
            current.load(fis);
        }

        String existingDbPassword = current.getProperty("spring.datasource.password", "");

        updateProperties(encryptedPassword, encryptedRecoveryKey, existingDbPassword, "true");

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
                                  String encDbPassword, String configuredValue) throws IOException {
        Properties props = new Properties();

        // Read the existing file
        try (FileInputStream fis = new FileInputStream(propertiesFilePath)) {
            props.load(fis);
        }

        // Update values
        props.setProperty("piki.security.password", encPassword);
        props.setProperty("piki.security.recovery-key", encRecoveryKey);
        props.setProperty("piki.security.configured", configuredValue);
        props.setProperty("spring.datasource.password", encDbPassword);

        // Write
        try (FileOutputStream fos = new FileOutputStream(propertiesFilePath)) {
            props.store(fos, "Piki Security Configuration — do not edit manually");
        }
    }
}
