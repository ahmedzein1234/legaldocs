/**
 * Secure password hashing using PBKDF2 with SHA-256
 *
 * Note: We use PBKDF2 instead of bcrypt because:
 * 1. PBKDF2 is available in Web Crypto API (Cloudflare Workers compatible)
 * 2. bcrypt requires Node.js crypto module which isn't available in Workers
 *
 * Configuration:
 * - 100,000 iterations (OWASP recommended minimum)
 * - 256-bit derived key
 * - 128-bit random salt
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Derive a key from password using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as a key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    KEY_LENGTH
  );

  return derivedBits;
}

/**
 * Hash a password with a random salt
 * Returns format: iterations:salt:hash (all hex encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const derivedKey = await deriveKey(password, salt);

  const saltHex = bufferToHex(salt.buffer as ArrayBuffer);
  const hashHex = bufferToHex(derivedKey);

  // Format: iterations:salt:hash
  return `${ITERATIONS}:${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const parts = storedHash.split(':');

    // Handle legacy SHA-256 hashes (base64 encoded, no colons)
    if (parts.length === 1) {
      // Legacy format - simple SHA-256 hash
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hash = await crypto.subtle.digest('SHA-256', data);
      const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
      return hashBase64 === storedHash;
    }

    if (parts.length !== 3) {
      return false;
    }

    const [iterationsStr, saltHex, expectedHashHex] = parts;
    const iterations = parseInt(iterationsStr, 10);

    if (iterations !== ITERATIONS) {
      // For security, we could re-hash with new iterations on successful login
      // For now, just verify with the stored iterations
    }

    const salt = hexToBuffer(saltHex);
    const derivedKey = await deriveKey(password, salt);
    const actualHashHex = bufferToHex(derivedKey);

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(actualHashHex, expectedHashHex);
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Check if a hash needs to be upgraded (e.g., legacy format)
 */
export function needsRehash(storedHash: string): boolean {
  const parts = storedHash.split(':');

  // Legacy format (no colons) needs upgrade
  if (parts.length === 1) {
    return true;
  }

  // Check if iterations need to be increased
  const iterations = parseInt(parts[0], 10);
  return iterations < ITERATIONS;
}
