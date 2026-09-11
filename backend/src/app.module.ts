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
import { NotificationsModule } from './notifications/notifications.module';
import { GalleryModule } from './gallery/gallery.module';
import { PoliciesModule } from './policies/policies.module';
import { AgmModule } from './agm/agm.module';
import { HydroModule } from './hydro/hydro.module';
import { PageContentModule } from './page-content/page-content.module';
import { DownloadsModule } from './downloads/downloads.module';
import { FinancialsModule } from './financials/financials.module';
import { ExecutivesModule } from './executives/executives.module';
import { HeroSlidesModule } from './hero-slides/hero-slides.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { DignitariesModule } from './dignitaries/dignitaries.module';
import { OfficialContactsModule } from './official-contacts/official-contacts.module';
import { ContactSubOfficesModule } from './contact-sub-offices/contact-sub-offices.module';

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
    DignitariesModule,
    AuditLogsModule,
    TendersModule,
    CareersModule,
    PressReleasesModule,
    UsersModule,
    UploadModule,
    NotificationsModule,
    GalleryModule,
    PoliciesModule,
    AgmModule,
    HydroModule,
    PageContentModule,
    DownloadsModule,
    FinancialsModule,
    ExecutivesModule,
    HeroSlidesModule,
    SiteSettingsModule,
    OfficialContactsModule,
    ContactSubOfficesModule,
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
