import * as crypto from 'crypto';

// OWASP-recommended scrypt parameters (OWASP Password Storage Cheat Sheet)
// Target configuration: N=2^14 (16384), r=8, p=5
export const SCRYPT_PARAMS = {
  N: 16384, // CPU/memory cost parameter (2^14)
  r: 8,     // Block size parameter
  p: 5,     // Parallelization parameter (OWASP recommended combination: N=2^14, r=8, p=5)
  maxmem: 64 * 1024 * 1024, // 64 MB memory ceiling (accommodates 16 MB scrypt working memory)
  keyLen: 32,  // 256-bit derived key length
  saltLen: 16, // 128-bit salt length
};

export class PasswordUtil {
  /**
   * Hashes a password using OWASP-recommended scrypt with a unique random salt.
   * Output format: $scrypt$N=16384,r=8,p=5$<salt_base64>$<hash_base64>
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(SCRYPT_PARAMS.saltLen);
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(
        password,
        salt,
        SCRYPT_PARAMS.keyLen,
        {
          N: SCRYPT_PARAMS.N,
          r: SCRYPT_PARAMS.r,
          p: SCRYPT_PARAMS.p,
          maxmem: SCRYPT_PARAMS.maxmem,
        },
        (err, key) => {
          if (err) reject(err);
          else resolve(key);
        },
      );
    });

    const saltB64 = salt.toString('base64');
    const hashB64 = derivedKey.toString('base64');
    return `$scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${saltB64}$${hashB64}`;
  }

  /**
   * Synchronous scrypt hash utility.
   */
  static hashPasswordSync(password: string): string {
    const salt = crypto.randomBytes(SCRYPT_PARAMS.saltLen);
    const derivedKey = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keyLen, {
      N: SCRYPT_PARAMS.N,
      r: SCRYPT_PARAMS.r,
      p: SCRYPT_PARAMS.p,
      maxmem: SCRYPT_PARAMS.maxmem,
    });

    const saltB64 = salt.toString('base64');
    const hashB64 = derivedKey.toString('base64');
    return `$scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${saltB64}$${hashB64}`;
  }

  /**
   * Detects whether the given stored hash is a legacy unsalted SHA-256 hash (64 hex characters).
   */
  static isLegacySha256(storedHash: string): boolean {
    return /^[0-9a-f]{64}$/i.test(storedHash);
  }

  /**
   * Verifies candidate password against either modern scrypt hash or legacy SHA-256 hash.
   * Performs constant-time comparison to prevent timing attacks.
   */
  static async verifyPassword(
    password: string,
    storedHash: string,
  ): Promise<{ valid: boolean; isLegacy: boolean }> {
    if (!storedHash || typeof storedHash !== 'string') {
      return { valid: false, isLegacy: false };
    }

    // 1. Legacy SHA-256 verification (64 hex characters)
    if (this.isLegacySha256(storedHash)) {
      const candidateHash = crypto.createHash('sha256').update(password).digest('hex');
      const storedBuf = Buffer.from(storedHash, 'hex');
      const candidateBuf = Buffer.from(candidateHash, 'hex');

      const match =
        storedBuf.length === candidateBuf.length &&
        crypto.timingSafeEqual(storedBuf, candidateBuf);
      return { valid: match, isLegacy: true };
    }

    // 2. Modern Scrypt verification ($scrypt$N=...,r=...,p=...$<salt>$<hash>)
    if (storedHash.startsWith('$scrypt$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 5) {
        return { valid: false, isLegacy: false };
      }

      const paramsStr = parts[2];
      const saltB64 = parts[3];
      const hashB64 = parts[4];

      const params: Record<string, number> = {};
      paramsStr.split(',').forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k && v) params[k] = parseInt(v, 10);
      });

      const N = params['N'] || SCRYPT_PARAMS.N;
      const r = params['r'] || SCRYPT_PARAMS.r;
      const p = params['p'] || SCRYPT_PARAMS.p;

      const salt = Buffer.from(saltB64, 'base64');
      const expectedKey = Buffer.from(hashB64, 'base64');

      const dynamicMaxmem = Math.max(128 * N * r * 2, SCRYPT_PARAMS.maxmem);
      const derivedKey = await new Promise<Buffer>((resolve, reject) => {
        crypto.scrypt(
          password,
          salt,
          expectedKey.length,
          { N, r, p, maxmem: dynamicMaxmem },
          (err, key) => {
            if (err) reject(err);
            else resolve(key);
          },
        );
      });


      const match =
        expectedKey.length === derivedKey.length &&
        crypto.timingSafeEqual(expectedKey, derivedKey);
      return { valid: match, isLegacy: false };
    }

    return { valid: false, isLegacy: false };
  }
}
