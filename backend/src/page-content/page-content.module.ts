import { Module } from '@nestjs/common';
import { PageContentController } from './page-content.controller';
import { PageContentService } from './page-content.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PageContentController],
  providers: [PageContentService, PrismaService],
  exports: [PageContentService],
})
export class PageContentModule {}
