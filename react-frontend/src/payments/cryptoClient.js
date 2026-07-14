// Hybrid encryption client — RSA-2048/OAEP + AES-256-GCM.
//
// Flow for every secure payment call:
//   1. Fetch the server's RSA public key (cached for the session lifetime).
//   2. Generate a fresh AES-256-GCM session key per request.
//   3. Encrypt the request body JSON with AES-GCM → { payload, iv }.
//   4. Wrap the AES key with RSA-OAEP → encryptedKey.
//   5. POST { encryptedKey, payload, iv } to the /secure endpoint.
//   6. Decrypt the response (same AES key, new IV from server).
//
// Uses only the built-in SubtleCrypto API — no external libraries required.

const BASE_URL = import.meta.env.VITE_API_URL || "";

// ── Public key cache ──────────────────────────────────────────────────────────
// The RSA key pair is generated once on server startup and lives for the
// process lifetime. We fetch and import it once per browser session.
// Call invalidatePublicKey() if you suspect the server restarted.

let _cachedPublicKey = null;

async function getPublicKey() {
  if (_cachedPublicKey) return _cachedPublicKey;

  const res = await fetch(`${BASE_URL}/payments/public-key`);
  if (!res.ok) throw new Error("Could not fetch encryption public key from server.");
  const { publicKey } = await res.json();

  // publicKey is Base64-encoded SubjectPublicKeyInfo (SPKI/DER) — the exact
  // format SubtleCrypto.importKey("spki", ...) expects from Java's getEncoded().
  const keyBytes = fromBase64(publicKey);

  _cachedPublicKey = await crypto.subtle.importKey(
    "spki",
    keyBytes,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,        // not extractable — only encrypt with it, never export
    ["encrypt"]
  );

  return _cachedPublicKey;
}

/** Drop the cached key — call after detecting a server restart or 400 on /secure. */
export function invalidatePublicKey() {
  _cachedPublicKey = null;
}

// ── Core: encrypt a request payload ──────────────────────────────────────────

/**
 * Encrypts `payload` (any JSON-serializable object) for a /secure endpoint.
 *
 * @returns {{ envelope: EncryptedRequest, aesKey: CryptoKey }}
 *   `envelope` is what you POST to the server.
 *   `aesKey` must be kept in memory to decrypt the response — never store it.
 */
async function encryptRequest(payload) {
  const publicKey = await getPublicKey();

  // Step 1 — fresh AES-256-GCM session key, unique to this one request
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,         // extractable so we can export raw bytes for RSA wrapping
    ["encrypt", "decrypt"]
  );

  // Step 2 — encrypt payload JSON with AES-256-GCM + random 12-byte nonce
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const jsonBytes = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    jsonBytes
  );

  // Step 3 — export raw AES key bytes, then wrap them with RSA-OAEP
  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKey
  );

  return {
    envelope: {
      encryptedKey: toBase64(encryptedKey),   // RSA-wrapped AES key
      payload: toBase64(ciphertext),           // AES-GCM ciphertext + auth tag
      iv: toBase64(iv),                        // 12-byte nonce
    },
    aesKey,
  };
}

// ── Core: decrypt a server response ──────────────────────────────────────────

/**
 * Decrypts the server's `{ payload, iv }` response envelope.
 * Uses the same AES key that was used to encrypt the request —
 * the server reuses it for the response and sends a fresh IV.
 *
 * @param {{ payload: string, iv: string }} encryptedResponse
 * @param {CryptoKey} aesKey
 * @returns {Promise<object>} parsed response JSON
 */
async function decryptResponse(encryptedResponse, aesKey) {
  const iv         = fromBase64(encryptedResponse.iv);
  const ciphertext = fromBase64(encryptedResponse.payload);

  let plaintext;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      ciphertext
    );
  } catch {
    // GCM auth tag mismatch — response was tampered with in transit.
    throw new Error("Response integrity check failed. The server response may have been tampered with.");
  }

  return JSON.parse(new TextDecoder().decode(plaintext));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Encrypted POST — encrypts `payload`, sends to `path`, decrypts the response.
 *
 * Drop-in replacement for apiRequest() for /secure endpoints.
 * Returns the decrypted response body (same shape as the plaintext endpoint).
 *
 * @param {string} path     e.g. "/payments/razorpay/create-order/secure"
 * @param {object} payload  the raw request body object (NOT pre-serialized)
 * @param {string} [token]  Bearer token for Authorization header
 */
export async function securePost(path, payload, token) {
  const { envelope, aesKey } = await encryptRequest(payload);

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(envelope),
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (body && body.message) || `Encrypted request failed (${res.status})`;
    throw new Error(message);
  }

  return decryptResponse(body, aesKey);
}

// ── Base64 helpers ────────────────────────────────────────────────────────────
// Loop-based to avoid call-stack overflow on large buffers (spread operator
// inside btoa(String.fromCharCode(...buf)) blows the stack beyond ~64 KB).

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
