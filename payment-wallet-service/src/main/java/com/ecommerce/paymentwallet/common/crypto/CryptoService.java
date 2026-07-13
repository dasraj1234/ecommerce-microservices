package com.ecommerce.paymentwallet.common.crypto;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Hybrid encryption: RSA-2048/OAEP-SHA256 for key transport,
 * AES-256-GCM for payload confidentiality and integrity.
 *
 * Usage for incoming encrypted payment requests:
 *   byte[] aesKey = extractAesKey(request.getEncryptedKey());
 *   String json   = decryptPayload(request.getPayload(), request.getIv(), aesKey);
 *   // ... process json ...
 *   EncryptedRequest response = encryptResponseWithKey(responseJson, aesKey);
 *
 * Usage for audit log at-rest encryption:
 *   String stored = encryptForAudit(plaintext);   // "iv.ciphertext"
 */
@Service
@RequiredArgsConstructor
public class CryptoService {

    private static final int GCM_IV_BYTES = 12;
    private static final int GCM_TAG_BITS = 128;

    private final RsaKeyService rsaKeyService;

    /** 32-byte Base64 AES-256 key used only for server-side audit log encryption. */
    @Value("${payment.crypto.audit-key}")
    private String auditKeyBase64;

    // ── Key transport ─────────────────────────────────────────────────────────

    /**
     * Unwraps the RSA-OAEP-encrypted AES-256 session key sent by the caller.
     * Call once per request and reuse the returned bytes for both decrypt and encrypt.
     */
    public byte[] extractAesKey(String encryptedKeyBase64) throws Exception {
        return rsaKeyService.decryptAesKey(encryptedKeyBase64);
    }

    // ── Payload encryption / decryption ───────────────────────────────────────

    /** AES-256-GCM decrypt. Throws on tampered ciphertext (GCM tag mismatch). */
    public String decryptPayload(String payloadBase64, String ivBase64, byte[] aesKey) throws Exception {
        return aesDecrypt(payloadBase64, ivBase64, aesKey);
    }

    /**
     * AES-256-GCM encrypt. Returns an {@link EncryptedRequest} with a fresh random IV.
     * {@code encryptedKey} is null — the caller already holds the AES key.
     */
    public EncryptedRequest encryptResponseWithKey(String json, byte[] aesKey) throws Exception {
        return aesEncrypt(json, aesKey);
    }

    // ── Audit log (server-side symmetric) ────────────────────────────────────

    /**
     * Encrypts plaintext for storage in {@code payment_req_res}.
     * Format stored in DB: {@code <iv_base64>.<ciphertext_base64>}
     */
    public String encryptForAudit(String plaintext) throws Exception {
        byte[] key = Base64.getDecoder().decode(auditKeyBase64);
        EncryptedRequest enc = aesEncrypt(plaintext, key);
        return enc.getIv() + "." + enc.getPayload();
    }

    // ── Core AES-256-GCM primitives ───────────────────────────────────────────

    EncryptedRequest aesEncrypt(String plaintext, byte[] aesKeyBytes) throws Exception {
        byte[] iv = new byte[GCM_IV_BYTES];
        new SecureRandom().nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE,
                new SecretKeySpec(aesKeyBytes, "AES"),
                new GCMParameterSpec(GCM_TAG_BITS, iv));

        byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

        return new EncryptedRequest(
                null,
                Base64.getEncoder().encodeToString(ciphertext),
                Base64.getEncoder().encodeToString(iv)
        );
    }

    String aesDecrypt(String payloadBase64, String ivBase64, byte[] aesKeyBytes) throws Exception {
        byte[] iv         = Base64.getDecoder().decode(ivBase64);
        byte[] ciphertext = Base64.getDecoder().decode(payloadBase64);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE,
                new SecretKeySpec(aesKeyBytes, "AES"),
                new GCMParameterSpec(GCM_TAG_BITS, iv));

        return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
    }
}
