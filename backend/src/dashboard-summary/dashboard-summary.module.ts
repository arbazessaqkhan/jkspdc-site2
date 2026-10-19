import { Module } from '@nestjs/common';
import { DashboardSummaryController } from './dashboard-summary.controller';
import { DashboardSummaryService } from './dashboard-summary.service';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [DashboardSummaryController],
  providers: [DashboardSummaryService, PrismaService, AuthService],
})
export class DashboardSummaryModule {}
