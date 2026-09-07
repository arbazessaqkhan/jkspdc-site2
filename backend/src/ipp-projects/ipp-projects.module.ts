import { Module } from '@nestjs/common';
import { IppProjectsController } from './ipp-projects.controller';
import { IppProjectsService } from './ipp-projects.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [IppProjectsController],
  providers: [IppProjectsService, PrismaService],
  exports: [IppProjectsService],
})
export class IppProjectsModule {}
