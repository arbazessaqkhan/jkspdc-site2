import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HttpThrottlerGuard } from './http-throttler.guard';
import { PrismaService } from './prisma.service';
import { ContactController } from './contact/contact.controller';
import { ContactService } from './contact/contact.service';
import { PublicApiController } from './public-api/public-api.controller';
import { PublicApiService } from './public-api/public-api.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { DirectorsModule } from './directors/directors.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { TendersModule } from './tenders/tenders.module';
import { CareersModule } from './careers/careers.module';
import { PressReleasesModule } from './press-releases/press-releases.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    ProjectsModule,
    DirectorsModule,
    AuditLogsModule,
    TendersModule,
    CareersModule,
    PressReleasesModule,
    UsersModule,
    UploadModule,
  ],
  controllers: [
    ContactController,
    PublicApiController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: HttpThrottlerGuard,
    },
    PrismaService,
    ContactService,
    PublicApiService,
  ],
})
export class AppModule {}
