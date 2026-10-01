import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { validateStartupEnvironment } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // GIGW/OWASP: Validate critical startup configuration (fails fast in production)
  validateStartupEnvironment(configService);

  // GIGW/OWASP: Sanitize unexpected 500 errors to prevent leaking internal database/stack details
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Trust single reverse proxy hop (Nginx: client -> Nginx -> NestJS)
  // Ensures req.ip resolves the real client IP for rate limiting and audit logs
  // while refusing to trust arbitrary spoofed multi-hop proxy chains.
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // ── GIGW/OWASP: HTTP Security Headers via Helmet ──────────────────────────
  // Must be first middleware so headers appear on ALL responses including errors.
  app.use(
    helmet({
      // X-Content-Type-Options: nosniff — prevents MIME-sniffing attacks
      xContentTypeOptions: true,
      // X-Frame-Options: SAMEORIGIN — prevents clickjacking
      frameguard: { action: 'sameorigin' },
      // X-XSS-Protection (legacy IE compatibility)
      xXssProtection: true,
      // Referrer-Policy — limits referrer info sent to third parties
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      // Disable X-Powered-By to hide server technology
      hidePoweredBy: true,
      // HSTS — only enforce over HTTPS; in development this is a no-op over HTTP
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // Cross-Origin-Resource-Policy — allow static assets and uploads to be loaded from frontend
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Content-Security-Policy — permissive policy for government SSR site
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Inline scripts used in Astro SSR
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'http:', 'https:'],
          connectSrc: [
            "'self'",
            'https://translation-plugin.bhashini.co.in', // Bhashini translation API
            'http://localhost:3000',  // Backend API (dev — update for production)
          ],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
    }),
  );

  // ── GIGW/OWASP: Permissions-Policy & Cache-Control Middleware ───────────────
  app.use((req: any, res: any, next: any) => {
    // Restrictive Permissions-Policy: Disable unused hardware capabilities
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
    );

    // Cache-Control: Prevent caching for auth and authenticated administrative responses
    const isAuthEndpoint = req.originalUrl?.includes('/api/auth') || req.path?.startsWith('/api/auth');
    const hasAuthHeader = !!req.headers['authorization'];
    const isAdminEndpoint = req.originalUrl?.includes('/api/admin') || req.path?.startsWith('/api/admin');

    if (isAuthEndpoint || hasAuthHeader || isAdminEndpoint) {
      res.setHeader('Cache-Control', 'no-store, private');
      res.setHeader('Pragma', 'no-cache');
    }

    next();
  });

  // ── Disable X-Powered-By at Express level (belt-and-suspenders) ──────────
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Configure payload size limit for large uploads (up to 100MB + headers)
  app.use(express.json({ limit: '110mb' }));
  app.use(express.urlencoded({ limit: '110mb', extended: true }));

  // Set global prefix for API endpoints
  app.setGlobalPrefix('api');

  // Serve static files from uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  // ── Secure Static File Serving for /uploads ──────────────────────────────
  const ALLOWED_SERVE_EXTS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
  app.use('/uploads', (req: any, res: any, next: any) => {
    // 1. Defend against path traversal or null-byte poisoning in URL path
    const safePath = path.normalize(req.path);
    if (safePath.includes('..') || safePath.includes('\0')) {
      return res.status(400).json({ statusCode: 400, message: 'Invalid file path' });
    }

    // 2. Reject requests for non-whitelisted file extensions immediately
    const ext = path.extname(safePath).toLowerCase();
    if (safePath !== '/' && !ALLOWED_SERVE_EXTS.includes(ext)) {
      return res.status(404).json({ statusCode: 404, message: 'File not found' });
    }

    next();
  });

  app.use(
    '/uploads',
    express.static(uploadsDir, {
      dotfiles: 'ignore', // Never serve hidden files (.env, .git, etc.)
      index: false,       // Disable directory listing
      fallthrough: false, // If file doesn't exist, terminate with 404 immediately
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        // GIGW/OWASP: Security headers on static asset responses
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.pdf') {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'inline');
        } else if (ext === '.jpg' || ext === '.jpeg') {
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Content-Disposition', 'inline');
        } else if (ext === '.png') {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Disposition', 'inline');
        } else if (['.doc', '.docx', '.xls', '.xlsx'].includes(ext)) {
          // Force attachment download for binary documents to prevent any browser execution
          const safeName = path.basename(filePath);
          res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
        }
      },
    }),
  );

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

  // Low-level Express middleware — handles CORS safely and strictly.
  // Wildcard '*' MUST NEVER reflect arbitrary client origins when credentials are enabled.
  app.use((req: any, res: any, next: any) => {
    const origin = (req.headers['origin'] || req.headers['Origin']) as string | undefined;

    // Origin is allowed with credentials ONLY if explicitly included in allowedOrigins
    const isExplicitlyAllowed = origin ? allowedOrigins.includes(origin) : false;

    if (origin) {
      if (isExplicitlyAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
      }
      // If origin is not explicitly allowed, do NOT set Access-Control-Allow-Origin!
    } else {
      // Non-browser requests (curl, server-to-server) without Origin header
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );

    // Short-circuit OPTIONS preflight — responds before guards can intercept
    if (req.method === 'OPTIONS') {
      res.statusCode = isExplicitlyAllowed || !origin ? 204 : 403;
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }
    next();
  });

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow if no origin (non-browser) or explicitly matches allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Disallow wildcard or unlisted origins with credentials
        callback(new Error('Not allowed by CORS'), false);
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
