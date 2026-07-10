import { Module } from '@nestjs/common';
import { PressReleasesService } from './press-releases.service';
import { PressReleasesController } from './press-releases.controller';
import { PrismaService } from '../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [PressReleasesController],
  providers: [PressReleasesService, PrismaService, AuthService],
})
export class PressReleasesModule {}
