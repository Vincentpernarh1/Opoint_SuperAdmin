import CryptoJS from 'crypto-js';

// Shared secret key for encryption/decryption (store securely in env vars)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-default-secret-key-change-this'; // Use a strong key in production

/**
 * Encrypts a plain text string using AES encryption.
 * Returns a base64-encoded string safe for URLs.
 * @param text - The plain text to encrypt (e.g., company ID as string)
 * @returns The encrypted, base64-encoded string
 */
export function encrypt(text: string): string {
  const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  return encrypted;
}

/**
 * Decrypts a base64-encoded encrypted string back to plain text.
 * @param encryptedText - The base64-encoded encrypted string
 * @returns The decrypted plain text (e.g., company ID)
 */
export function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}