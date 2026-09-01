import { Module } from '@nestjs/common';
import { ExecutivesController } from './executives.controller';
import { ExecutivesService } from './executives.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ExecutivesController],
  providers: [ExecutivesService, PrismaService],
  exports: [ExecutivesService],
})
export class ExecutivesModule {}
