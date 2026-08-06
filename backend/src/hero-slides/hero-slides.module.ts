import { Module } from '@nestjs/common';
import { HeroSlidesController } from './hero-slides.controller';
import { HeroSlidesService } from './hero-slides.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HeroSlidesController],
  providers: [HeroSlidesService, PrismaService],
  exports: [HeroSlidesService],
})
export class HeroSlidesModule {}
