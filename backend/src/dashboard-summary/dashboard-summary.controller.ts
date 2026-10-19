import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardSummaryService } from './dashboard-summary.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('dashboard-summary')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DashboardSummaryController {
  constructor(private readonly summaryService: DashboardSummaryService) {}

  @Get()
  async getSummary() {
    return this.summaryService.getSummary();
  }
}
