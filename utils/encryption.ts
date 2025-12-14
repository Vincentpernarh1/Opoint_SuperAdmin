import crypto from 'crypto';

// Shared secret key for encryption/decryption (store securely in env vars)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-default-secret-key-change-this'; // Use a strong key in production
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // Initialization vector length
const KEY = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32); // Derive a 32-byte key

/**
 * Encrypts a plain text string using AES encryption.
 * Returns a base64-encoded string safe for URLs, including the IV.
 * @param text - The plain text to encrypt (e.g., company ID as string)
 * @returns The encrypted, base64-encoded string
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  // Prepend IV to encrypted data and encode as base64
  const encryptedWithIv = iv.toString('base64') + ':' + encrypted;
  return Buffer.from(encryptedWithIv).toString('base64');
}

/**
 * Decrypts a base64-encoded encrypted string back to plain text.
 * @param encryptedText - The base64-encoded encrypted string (including IV)
 * @returns The decrypted plain text (e.g., company ID)
 */
export function decrypt(encryptedText: string): string {
  const encryptedWithIv = Buffer.from(encryptedText, 'base64').toString('utf8');
  const [ivBase64, encrypted] = encryptedWithIv.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}