import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService, PrismaService, AuthService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
