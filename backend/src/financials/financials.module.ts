import { Module } from '@nestjs/common';
import { FinancialsController } from './financials.controller';
import { FinancialsService } from './financials.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FinancialsController],
  providers: [FinancialsService, PrismaService],
  exports: [FinancialsService],
})
export class FinancialsModule {}
