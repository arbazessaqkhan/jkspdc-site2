import { Module } from '@nestjs/common';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DownloadsController],
  providers: [DownloadsService, PrismaService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
