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
