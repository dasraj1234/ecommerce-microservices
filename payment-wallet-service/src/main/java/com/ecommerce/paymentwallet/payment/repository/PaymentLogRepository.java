package com.ecommerce.paymentwallet.payment.repository;

import com.ecommerce.paymentwallet.common.crypto.CryptoService;
import com.ecommerce.paymentwallet.common.util.QueryConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Slf4j
@Repository
public class PaymentLogRepository {

    private final JdbcTemplate jdbc;
    private final CryptoService cryptoService;

    public PaymentLogRepository(JdbcTemplate jdbc, CryptoService cryptoService) {
        this.jdbc = jdbc;
        this.cryptoService = cryptoService;
    }

    /**
     * Persists a payment audit record with both plaintext and encrypted payloads.
     *
     * - request_payload / response_payload   → raw JSON (plaintext, for verification)
     * - request_payload_enc / response_payload_enc → AES-256-GCM encrypted (for security)
     *
     * Storing both lets you confirm the crypto is working correctly by comparing the
     * two columns, and ensures you can always read audit data without the crypto key
     * for operational/debugging purposes.
     */
    public void log(String pid, String req, String res, String status, String reason) {
        jdbc.update(
                QueryConstants.INSERT_PAYMENT_LOG,
                pid,
                req,
                encryptSafe(req),
                res,
                encryptSafe(res),
                status,
                reason
        );
    }

    private String encryptSafe(String plaintext) {
        if (plaintext == null) return null;
        try {
            return cryptoService.encryptForAudit(plaintext);
        } catch (Exception e) {
            // Audit record must always be written — mark the payload as unencryptable
            // rather than dropping the row or letting a crypto failure break payment flow.
            log.error("Audit payload encryption failed; storing marker instead", e);
            return "[ENCRYPTION_FAILED]";
        }
    }
}