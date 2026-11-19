import * as crypto from 'crypto';

/**
 * Enterprise AES-256-GCM encryption utility for protecting sensitive MFA secrets at rest.
 * Uses authenticated encryption with tamper detection (GCM auth tag) and ciphertext key versioning.
 */
export class MfaCryptoUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96-bit IV recommended for GCM
  private static readonly KEY_SALT = ':jkspdc-mfa-at-rest-v1';
  public static readonly CURRENT_VERSION = 'v1';

  private static deriveKey(masterSecret: string): Buffer {
    if (!masterSecret || typeof masterSecret !== 'string' || masterSecret.trim().length === 0) {
      throw new Error('MFA master encryption key must be provided');
    }
    return crypto
      .createHash('sha256')
      .update(masterSecret.trim() + MfaCryptoUtil.KEY_SALT)
      .digest();
  }

  /**
   * Encrypts plaintext string using AES-256-GCM with key version header
   * Returns formatted string: v1:ivHex:tagHex:cipherHex
   */
  static encrypt(plaintext: string, masterSecret: string): string {
    const key = this.deriveKey(masterSecret);
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${this.CURRENT_VERSION}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypts AES-256-GCM payload with integrity verification and key versioning support
   * Supports both versioned ('v1:iv:tag:ct') and legacy ('iv:tag:ct') payloads for seamless upgrades
   */
  static decrypt(payload: string, masterSecret: string): string {
    if (!payload || typeof payload !== 'string') {
      throw new Error('MFA encrypted payload must be a non-empty string');
    }

    const parts = payload.split(':');
    let ivHex: string;
    let tagHex: string;
    let cipherHex: string;

    if (parts.length === 4 && parts[0] === 'v1') {
      // Modern versioned format
      [, ivHex, tagHex, cipherHex] = parts;
    } else if (parts.length === 3) {
      // Legacy unversioned format
      [ivHex, tagHex, cipherHex] = parts;
    } else {
      throw new Error('Malformed or unsupported encrypted payload format');
    }

    const key = this.deriveKey(masterSecret);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const ciphertext = Buffer.from(cipherHex, 'hex');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  }

  /**
   * Re-encrypts an existing payload with a new key and upgrades format to current version
   */
  static rotateKey(payload: string, oldSecret: string, newSecret: string): string {
    const decrypted = this.decrypt(payload, oldSecret);
    return this.encrypt(decrypted, newSecret);
  }
}


