import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global prefix for API endpoints
  app.setGlobalPrefix('api');

  // Serve static files from uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // GIGW/OWASP-compliant global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure CORS using environment whitelist
  const rawCorsOrigins = configService.get<string>('CORS_ORIGIN') || 'http://localhost';
  // Strip surrounding quotes that some .env parsers leave in, and trim each origin
  const allowedOrigins = rawCorsOrigins
    .replace(/^["']|["']$/g, '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Low-level Express middleware — handles CORS before any NestJS guard runs.
  // Critical: ensures CORS headers are present even on error responses (500s from guards)
  // so the browser never sees a raw "CORS error" when the real issue is a server error.
  app.use((req: any, res: any, next: any) => {
    const origin = (req.headers['origin'] || req.headers['Origin']) as string | undefined;
    // In dev mode allow all configured origins; fall back to wildcard if no origin sent
    if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else if (!origin) {
      // Non-browser requests (curl, server-to-server) — allow
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    // Short-circuit OPTIONS preflight — responds before guards can intercept
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }
    next();
  });

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`[JKSPDC API] Server running securely on port ${port}`);
  console.log(`[JKSPDC API] CORS allowed origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
