import { Module } from '@nestjs/common';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';
import { PrismaService } from '../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [CareersController],
  providers: [CareersService, PrismaService, AuthService],
})
export class CareersModule {}
