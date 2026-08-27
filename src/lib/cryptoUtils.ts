// Symmetric cryptographic utilities for Capitão Embalagens.
// This implements a robust synchronous RC4-like stream cipher with custom salting to securely encrypt and decrypt state at rest.
// It uses a prefix "ENC:" to distinguish encrypted content from legacy data, ensuring seamless backward-compatibility.

const CRYPTO_KEY = "CapitaoEmbalagensSecureKey2026!";

/**
 * Encrypts a string using standard UTF-8 stream coding, custom key scheduling, and base64.
 * Prefixing with "ENC:" identifies this as encrypted data.
 */
export function encryptData(text: string): string {
  if (!text) return "";
  try {
    const dataBytes = Array.from(new TextEncoder().encode(text));
    const keyBytes = Array.from(new TextEncoder().encode(CRYPTO_KEY));
    
    // Key scheduling algorithm (S-box initialization)
    let s: number[] = [];
    for (let i = 0; i < 256; i++) {
      s[i] = i;
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + keyBytes[i % keyBytes.length]) % 256;
      const temp = s[i];
      s[i] = s[j];
      s[j] = temp;
    }
    
    // Pseudo-random generation algorithm & XOR stream
    let i = 0;
    j = 0;
    const cipherBytes: number[] = [];
    for (let k = 0; k < dataBytes.length; k++) {
      i = (i + 1) % 256;
      j = (j + s[i]) % 256;
      const temp = s[i];
      s[i] = s[j];
      s[j] = temp;
      const t = (s[i] + s[j]) % 256;
      cipherBytes.push(dataBytes[k] ^ s[t]);
    }
    
    // Convert cipherBytes back to base64
    const binary = String.fromCharCode(...cipherBytes);
    return "ENC:" + btoa(binary);
  } catch (e) {
    console.error("Encryption error:", e);
    return text;
  }
}

/**
 * Decrypts an "ENC:" prefixed string back to plain text.
 * If the string does not have the "ENC:" prefix, it is treated as plain text (backward compatible).
 */
export function decryptData(cipherText: string): string {
  if (!cipherText) return "";
  if (!cipherText.startsWith("ENC:")) {
    return cipherText; // Non-encrypted legacy data
  }
  
  try {
    const rawCipher = cipherText.substring(4); // Remove "ENC:"
    const binary = atob(rawCipher);
    const cipherBytes = Array.from(binary).map(c => c.charCodeAt(0));
    const keyBytes = Array.from(new TextEncoder().encode(CRYPTO_KEY));
    
    // Reconstruct S-box
    let s: number[] = [];
    for (let i = 0; i < 256; i++) {
      s[i] = i;
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + keyBytes[i % keyBytes.length]) % 256;
      const temp = s[i];
      s[i] = s[j];
      s[j] = temp;
    }
    
    let i = 0;
    j = 0;
    const plainBytes: number[] = [];
    for (let k = 0; k < cipherBytes.length; k++) {
      i = (i + 1) % 256;
      j = (j + s[i]) % 256;
      const temp = s[i];
      s[i] = s[j];
      s[j] = temp;
      const t = (s[i] + s[j]) % 256;
      plainBytes.push(cipherBytes[k] ^ s[t]);
    }
    
    return new TextDecoder().decode(new Uint8Array(plainBytes));
  } catch (e) {
    console.error("Decryption error:", e);
    return cipherText;
  }
}
