package com.ecommerce.paymentwallet.common.crypto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EncryptedRequest {

    /**
     * RSA-OAEP-SHA256 encrypted AES-256 key, Base64-encoded.
     * Null in server responses — the client already holds the AES key.
     */
    private String encryptedKey;

    /** AES-256-GCM ciphertext, Base64-encoded. */
    private String payload;

    /** GCM nonce (12 bytes), Base64-encoded. Fresh value per encryption. */
    private String iv;
}
