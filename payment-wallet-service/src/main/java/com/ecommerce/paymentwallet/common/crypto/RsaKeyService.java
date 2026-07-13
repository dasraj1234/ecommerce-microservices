package com.ecommerce.paymentwallet.common.crypto;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import java.security.*;
import java.util.Base64;

/**
 * Generates an in-memory RSA-2048 key pair at startup and exposes the public key
 * so callers can wrap a per-request AES-256 session key for hybrid encryption.
 *
 * Key lifetime: process lifetime. On restart the public key changes, so any
 * in-flight encrypted requests from before the restart will fail decryption —
 * this is acceptable for short-lived payment flows.
 */
@Service
public class RsaKeyService {

    private PrivateKey privateKey;
    private PublicKey publicKey;

    @PostConstruct
    void init() throws NoSuchAlgorithmException {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048, new SecureRandom());
        KeyPair pair = kpg.generateKeyPair();
        this.privateKey = pair.getPrivate();
        this.publicKey  = pair.getPublic();
    }

    /** Returns the DER-encoded RSA public key as a Base64 string (SubjectPublicKeyInfo format). */
    public String getPublicKeyBase64() {
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }

    /**
     * Decrypts an RSA-OAEP-SHA256 wrapped AES key.
     *
     * @param encryptedKeyBase64 Base64 of the RSA-encrypted AES key bytes
     * @return raw 32-byte AES-256 key
     */
    public byte[] decryptAesKey(String encryptedKeyBase64) throws Exception {
        byte[] encryptedKey = Base64.getDecoder().decode(encryptedKeyBase64);
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        return cipher.doFinal(encryptedKey);
    }
}
