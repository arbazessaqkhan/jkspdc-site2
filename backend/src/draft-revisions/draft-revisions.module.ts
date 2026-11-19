import { Module } from '@nestjs/common';
import { DraftRevisionsController } from './draft-revisions.controller';
import { DraftRevisionsService } from './draft-revisions.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DraftRevisionsController],
  providers: [DraftRevisionsService, PrismaService],
  exports: [DraftRevisionsService],
})
export class DraftRevisionsModule {}

