import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

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
          details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log:', e);
      return null;
    }
  }

  async findAllLegacy() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    if (!wantsPagination(q)) {
      return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.auditLog.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.auditLog.findMany({ where: undefined, orderBy: { createdAt: 'desc' }, skip, take }),
    });
  }
}
