package com.ecommerce.paymentwallet.payment.controller;

import com.ecommerce.paymentwallet.common.crypto.RsaKeyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Encryption APIs", description = "Public key distribution for hybrid payload encryption")
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class CryptoController {

    private final RsaKeyService rsaKeyService;

    /**
     * Returns the server's RSA-2048 public key (SubjectPublicKeyInfo / DER, Base64-encoded).
     *
     * Client-side flow:
     *   1. Import this key with SubtleCrypto.importKey("spki", ...)
     *   2. Generate a random AES-256 key
     *   3. Encrypt the AES key with RSA-OAEP-SHA256
     *   4. Encrypt the request body JSON with AES-256-GCM
     *   5. POST { encryptedKey, payload, iv } to a /secure endpoint
     */
    @Operation(summary = "Get RSA-2048 public key for payload encryption")
    @GetMapping("/public-key")
    public Map<String, String> getPublicKey() {
        return Map.of(
                "publicKey",         rsaKeyService.getPublicKeyBase64(),
                "keyAlgorithm",      "RSA-OAEP",
                "hashAlgorithm",     "SHA-256",
                "payloadAlgorithm",  "AES-256-GCM",
                "keyFormat",         "SPKI/DER/Base64"
        );
    }
}
