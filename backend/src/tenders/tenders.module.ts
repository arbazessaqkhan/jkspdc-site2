import { Module } from '@nestjs/common';
import { TendersService } from './tenders.service';
import { TendersController } from './tenders.controller';
import { PrismaService } from '../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [TendersController],
  providers: [TendersService, PrismaService, AuthService],
})
export class TendersModule {}
