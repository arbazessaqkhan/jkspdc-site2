import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [UploadController],
})
export class UploadModule {}
