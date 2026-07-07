import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global prefix for API endpoints
  app.setGlobalPrefix('api');

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
  const allowedOrigins = rawCorsOrigins.split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy (JKSPDC Security)'));
      }
    },
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`[JKSPDC API] Server running securely on port ${port}`);
}
bootstrap();
