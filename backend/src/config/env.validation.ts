import { ConfigService } from '@nestjs/config';

/**
 * Validates critical environment configuration on server bootstrap.
 * Fails fast in production if required variables are missing or malformed.
 * Does not expose or print secret values in logs.
 */
export function validateStartupEnvironment(configService: ConfigService): void {
  const rawNodeEnv = configService.get<string>('NODE_ENV');
  const nodeEnv = (rawNodeEnv !== undefined ? rawNodeEnv : process.env.NODE_ENV) || 'development';
  const isProduction = nodeEnv === 'production';

  const rawDbUrl = configService.get<string>('DATABASE_URL');
  const databaseUrl = rawDbUrl !== undefined ? rawDbUrl : process.env.DATABASE_URL;

  const rawCors = configService.get<string>('CORS_ORIGIN');
  const rawCorsOrigins = rawCors !== undefined ? rawCors : process.env.CORS_ORIGIN;

  if (isProduction) {
    if (!databaseUrl || databaseUrl.trim() === '') {
      throw new Error('[FATAL] DATABASE_URL environment variable is required in production.');
    }

    const validProtocol = /^(postgresql|postgres):/i.test(databaseUrl.trim());
    if (!validProtocol || databaseUrl.trim().toLowerCase().startsWith('file:')) {
      throw new Error('[FATAL] DATABASE_URL has an invalid protocol for production. Must be PostgreSQL (postgresql:// or postgres://). SQLite and file: URLs are forbidden in production.');
    }

    if (!rawCorsOrigins || rawCorsOrigins.trim() === '') {
      throw new Error('[FATAL] CORS_ORIGIN environment variable is required in production.');
    }

    const rawJwt = configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
    if (!rawJwt || rawJwt.includes('dev_secret') || rawJwt.includes('replace_this')) {
      throw new Error('[FATAL] JWT_SECRET must be set to a secure, random production secret (cannot use development placeholders).');
    }

    const rawSession = configService.get<string>('SESSION_SECRET') || process.env.SESSION_SECRET;
    if (!rawSession || rawSession.includes('dev_session') || rawSession.includes('replace_this')) {
      throw new Error('[FATAL] SESSION_SECRET must be set to a secure, random production secret (cannot use development placeholders).');
    }

    const rawMfaKey = configService.get<string>('MFA_ENCRYPTION_KEY') || process.env.MFA_ENCRYPTION_KEY;
    if (!rawMfaKey || rawMfaKey.trim().length < 32) {
      throw new Error('[FATAL] MFA_ENCRYPTION_KEY environment variable is required and must provide at least 256 bits of entropy (minimum 32 characters or 64 hex characters).');
    }

    const origins = rawCorsOrigins
      .replace(/^["']|["']$/g, '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    if (origins.includes('*')) {
      throw new Error(
        '[FATAL] CORS_ORIGIN must not contain wildcard "*" in production when credentials are enabled.',
      );
    }
  } else {
    // Non-production development checks
    if (!databaseUrl) {
      console.warn('[CONFIG WARN] DATABASE_URL is not set. Defaulting to local configuration.');
    }
  }
}
