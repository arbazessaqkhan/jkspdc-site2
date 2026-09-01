import { Module } from '@nestjs/common';
import { AgmService } from './agm.service';
import { AgmController } from './agm.controller';
import { PrismaService } from '../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [AgmController],
  providers: [AgmService, PrismaService, AuthService],
})
export class AgmModule {}
