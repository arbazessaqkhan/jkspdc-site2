import { Module } from '@nestjs/common';
import { SiteSettingsController } from './site-settings.controller';
import { SiteSettingsService } from './site-settings.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SiteSettingsController],
  providers: [SiteSettingsService, PrismaService],
  exports: [SiteSettingsService],
})
export class SiteSettingsModule {}
