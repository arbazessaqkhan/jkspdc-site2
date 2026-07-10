import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async log(userId: string, action: string, ipAddress: string, userAgent: string, details?: any) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          ipAddress,
          userAgent,
          details: details ? JSON.parse(JSON.stringify(details)) : null,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log:', e);
      return null;
    }
  }

  async findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
