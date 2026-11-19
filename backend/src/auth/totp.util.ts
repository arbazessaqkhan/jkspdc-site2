import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

// Standard RFC 4648 Base32 alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Unambiguous character set for recovery codes (excluding 0, O, 1, I, L)
const RECOVERY_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export class TotpUtil {
  /**
   * Generates a random Base32 encoded secret key (160 bits = 20 bytes standard for SHA-1 TOTP)
   */
  static generateSecret(byteLength = 20): string {
    const buffer = crypto.randomBytes(byteLength);
    return this.base32Encode(buffer);
  }

  /**
   * Encodes a Buffer to RFC 4648 Base32 string (without padding)
   */
  static base32Encode(buffer: Buffer): string {
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }

    return output;
  }

  /**
   * Decodes an RFC 4648 Base32 string to Buffer
   */
  static base32Decode(input: string): Buffer {
    const cleanInput = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];

    for (let i = 0; i < cleanInput.length; i++) {
      const val = BASE32_ALPHABET.indexOf(cleanInput[i]);
      if (val === -1) {
        throw new Error(`Invalid Base32 character encountered: ${cleanInput[i]}`);
      }
      value = (value << 5) | val;
      bits += 5;

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(bytes);
  }

  /**
   * Computes a standard 6-digit TOTP code per RFC 6238
   * @param secretBase32 Base32 secret string
   * @param timeOffsetSteps Time window offset in steps (e.g. -1 for previous 30s, +1 for next 30s)
   * @param stepSec Time step duration in seconds (standard = 30)
   */
  static generateTotp(secretBase32: string, timeOffsetSteps = 0, stepSec = 30): string {
    const key = this.base32Decode(secretBase32);
    const epochSeconds = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epochSeconds / stepSec) + timeOffsetSteps;

    const counterBuf = Buffer.alloc(8);
    counterBuf.writeBigUInt64BE(BigInt(counter));

    const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const codeInt = (
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)
    ) % 1000000;

    return codeInt.toString().padStart(6, '0');
  }

  /**
   * Verifies a 6-digit TOTP code and returns the exact matching 30s counter step
   * Enables strict monotonic step verification to prevent replay attacks
   */
  static verifyTotpWithStep(
    inputCode: string,
    secretBase32: string,
    windowSteps = 1,
    stepSec = 30,
  ): { valid: boolean; step: bigint | null } {
    if (!inputCode || typeof inputCode !== 'string' || !/^\d{6}$/.test(inputCode.trim())) {
      return { valid: false, step: null };
    }
    const cleanCode = inputCode.trim();
    const epochSeconds = Math.floor(Date.now() / 1000);
    const baseCounter = BigInt(Math.floor(epochSeconds / stepSec));

    for (let offset = -windowSteps; offset <= windowSteps; offset++) {
      const candidate = this.generateTotp(secretBase32, offset, stepSec);
      if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(candidate))) {
        return { valid: true, step: baseCounter + BigInt(offset) };
      }
    }
    return { valid: false, step: null };
  }

  /**
   * Verifies a 6-digit TOTP code using constant-time comparison across a drift window
   * @param inputCode The 6-digit user input
   * @param secretBase32 The base32 secret
   * @param windowSteps Drift tolerance in 30-second steps (default 1 = ±30 seconds)
   */
  static verifyTotp(inputCode: string, secretBase32: string, windowSteps = 1): boolean {
    return this.verifyTotpWithStep(inputCode, secretBase32, windowSteps).valid;
  }

  /**
   * Generates standard `otpauth://` URI recognized by Google Authenticator, Microsoft Authenticator, etc.
   */
  static generateOtpauthUri(accountEmail: string, secretBase32: string, issuer = 'JKSPDC'): string {
    const label = encodeURIComponent(`JKSPDC (${accountEmail})`);
    const encodedIssuer = encodeURIComponent(issuer);
    return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  /**
   * Generates a base64 Data URL for a QR code image representing the otpauth URI
   */
  static async generateQrDataUrl(otpauthUri: string): Promise<string> {
    return QRCode.toDataURL(otpauthUri, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: {
        dark: '#0B4F9C', // JKSPDC primary brand blue
        light: '#FFFFFF',
      },
    });
  }

  /**
   * Generates a batch of high-entropy, unambiguous recovery codes (12 characters, ~60 bits entropy)
   * Format: XXXX-XXXX-XXXX (e.g. 7KM4-P82X-9D3W)
   */
  static generateRecoveryCodes(count = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const bytes = crypto.randomBytes(12);
      let part1 = '';
      let part2 = '';
      let part3 = '';
      for (let j = 0; j < 4; j++) {
        part1 += RECOVERY_CHARSET[bytes[j] % RECOVERY_CHARSET.length];
        part2 += RECOVERY_CHARSET[bytes[j + 4] % RECOVERY_CHARSET.length];
        part3 += RECOVERY_CHARSET[bytes[j + 8] % RECOVERY_CHARSET.length];
      }
      codes.push(`${part1}-${part2}-${part3}`);
    }
    return codes;
  }

  /**
   * Normalizes and hashes a recovery code using keyed HMAC-SHA256 for secure storage
   */
  static hashRecoveryCode(code: string, hmacKey: string): string {
    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return crypto.createHmac('sha256', hmacKey).update(normalized).digest('hex');
  }

  /**
   * Generates a secure, single-use, time-limited administrator enrolment authorization code
   * Format: ENR-XXXX-XXXX-XXXX
   */
  static generateEnrollmentCode(): string {
    const bytes = crypto.randomBytes(12);
    let part1 = '';
    let part2 = '';
    let part3 = '';
    for (let j = 0; j < 4; j++) {
      part1 += RECOVERY_CHARSET[bytes[j] % RECOVERY_CHARSET.length];
      part2 += RECOVERY_CHARSET[bytes[j + 4] % RECOVERY_CHARSET.length];
      part3 += RECOVERY_CHARSET[bytes[j + 8] % RECOVERY_CHARSET.length];
    }
    return `ENR-${part1}-${part2}-${part3}`;
  }

  /**
   * Hashes an enrolment authorization code using keyed HMAC-SHA256 for secure database storage
   */
  static hashEnrollmentCode(code: string, hmacKey: string): string {
    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return crypto.createHmac('sha256', hmacKey).update(normalized).digest('hex');
  }
}

