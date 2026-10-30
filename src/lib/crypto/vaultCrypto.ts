import { EncryptedPayload } from '../types/vault';

/**
 * Syntoze Vault Crypto Engine
 *
 * Zero-knowledge client-side encryption using the Web Crypto API.
 * - Key Derivation: PBKDF2-HMAC-SHA256 (600,000 iterations per OWASP 2023)
 * - Cipher: AES-256-GCM (authenticated encryption)
 * - Every secret gets a unique 96-bit random IV
 * - Master key NEVER leaves browser memory
 */

const VAULT_VERIFIER_SENTINEL = 'SYNTOZE_VAULT_VERIFIED_OK_v1';
const PBKDF2_ITERATIONS = 600_000; // OWASP 2023 recommended minimum for PBKDF2-SHA256

// ============================================================
// HELPERS
// ============================================================

function getCrypto(): Crypto {
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  throw new Error('Web Crypto API is not available');
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  getCrypto().getRandomValues(bytes);
  return bytes;
}

export function generateSalt(): string {
  return bufferToBase64(generateRandomBytes(16));
}

export function generateIv(): string {
  return bufferToBase64(generateRandomBytes(12));
}

/**
 * Generate a formatted recovery code: SYN-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
 * Uses Base32 alphabet without ambiguous chars (0/O, 1/I/L)
 */
export function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = generateRandomBytes(24);
  let result = 'SYN';
  for (let i = 0; i < 6; i++) {
    let chunk = '';
    for (let j = 0; j < 4; j++) {
      chunk += chars[bytes[i * 4 + j] % chars.length];
    }
    result += `-${chunk}`;
  }
  return result;
}

// ============================================================
// KEY DERIVATION
// ============================================================

/**
 * Derive an AES-256-GCM CryptoKey from a passphrase + salt using PBKDF2
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  saltBase64: string
): Promise<CryptoKey> {
  const crypto = getCrypto();
  const salt = base64ToBuffer(saltBase64);
  const encoder = new TextEncoder();

  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as ArrayBufferView<ArrayBuffer>,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// ============================================================
// ENCRYPT / DECRYPT
// ============================================================

export async function encryptString(
  plaintext: string,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const crypto = getCrypto();
  const iv = generateRandomBytes(12);
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as ArrayBufferView<ArrayBuffer> },
    key,
    encoded
  );

  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv),
  };
}

export async function decryptString(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<string> {
  const crypto = getCrypto();
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as ArrayBufferView<ArrayBuffer> },
    key,
    ciphertext as ArrayBufferView<ArrayBuffer>
  );

  return new TextDecoder().decode(decrypted);
}

// ============================================================
// HASHING
// ============================================================

export async function sha256Hash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await getCrypto().subtle.digest('SHA-256', data);
  return bufferToBase64(hash);
}

// ============================================================
// VAULT SETUP & UNLOCK
// ============================================================

export interface VaultSetupResult {
  salt: string;
  keyCheckCiphertext: string;
  keyCheckIv: string;
  recoveryHash: string;
  recoveryEncryptedKey: string;
  recoverySalt: string; // format: "salt:iv"
  masterKey: CryptoKey;
}

/**
 * First-time vault setup: derive master key, create verifier, wrap key with recovery code
 */
export async function setupVault(
  masterPassphrase: string,
  recoveryCode: string
): Promise<VaultSetupResult> {
  const crypto = getCrypto();
  const salt = generateSalt();
  const masterKey = await deriveKeyFromPassphrase(masterPassphrase, salt);

  // 1. Encrypt verifier sentinel — used to check passphrase correctness
  const verifier = await encryptString(VAULT_VERIFIER_SENTINEL, masterKey);

  // 2. Export raw master key and wrap it with recovery-derived key
  const rawKey = await crypto.subtle.exportKey('raw', masterKey);
  const rawKeyB64 = bufferToBase64(rawKey);

  const recoverySalt = generateSalt();
  const recoveryKey = await deriveKeyFromPassphrase(recoveryCode, recoverySalt);
  const wrappedMaster = await encryptString(rawKeyB64, recoveryKey);

  // 3. Hash recovery code for validation without storing plaintext
  const recoveryHash = await sha256Hash(recoveryCode);

  return {
    salt,
    keyCheckCiphertext: verifier.ciphertext,
    keyCheckIv: verifier.iv,
    recoveryHash,
    recoveryEncryptedKey: wrappedMaster.ciphertext,
    recoverySalt: `${recoverySalt}:${wrappedMaster.iv}`,
    masterKey,
  };
}

/**
 * Unlock vault with master passphrase — verifies against sentinel
 */
export async function unlockVault(
  masterPassphrase: string,
  salt: string,
  keyCheckCiphertext: string,
  keyCheckIv: string
): Promise<{ success: boolean; masterKey?: CryptoKey; error?: string }> {
  try {
    const masterKey = await deriveKeyFromPassphrase(masterPassphrase, salt);
    const sentinel = await decryptString(
      { ciphertext: keyCheckCiphertext, iv: keyCheckIv },
      masterKey
    );

    if (sentinel === VAULT_VERIFIER_SENTINEL) {
      return { success: true, masterKey };
    }
    return { success: false, error: 'Incorrect master passphrase.' };
  } catch {
    return { success: false, error: 'Incorrect master passphrase.' };
  }
}

/**
 * Emergency vault unlock using recovery code
 */
export async function unlockWithRecovery(
  recoveryCode: string,
  recoveryEncryptedKey: string,
  recoverySalt: string,
  keyCheckCiphertext: string,
  keyCheckIv: string
): Promise<{ success: boolean; masterKey?: CryptoKey; error?: string }> {
  try {
    const crypto = getCrypto();
    const clean = recoveryCode.trim().toUpperCase();
    const [rSalt, rIv] = recoverySalt.split(':');

    // Derive key from recovery code and unwrap master key
    const recoveryKey = await deriveKeyFromPassphrase(clean, rSalt);
    const rawKeyB64 = await decryptString(
      { ciphertext: recoveryEncryptedKey, iv: rIv },
      recoveryKey
    );

    const rawKey = base64ToBuffer(rawKeyB64);
    const masterKey = await crypto.subtle.importKey(
      'raw',
      rawKey as ArrayBufferView<ArrayBuffer>,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Verify the restored key actually works
    const sentinel = await decryptString(
      { ciphertext: keyCheckCiphertext, iv: keyCheckIv },
      masterKey
    );

    if (sentinel === VAULT_VERIFIER_SENTINEL) {
      return { success: true, masterKey };
    }
    return { success: false, error: 'Recovery code verification failed.' };
  } catch {
    return { success: false, error: 'Invalid recovery code.' };
  }
}
