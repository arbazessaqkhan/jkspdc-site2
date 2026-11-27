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

  private async attachUsers(logs: any[]) {
    if (!logs || logs.length === 0) return logs;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const userIds = Array.from(
      new Set(
        logs
          .map((l) => l.userId)
          .filter((id): id is string => typeof id === 'string' && uuidRegex.test(id)),
      ),
    );
    if (userIds.length === 0) {
      return logs.map((l) => ({ ...l, user: null }));
    }
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    return logs.map((l) => ({
      ...l,
      user: userMap.get(l.userId) ?? null,
    }));
  }

  async findAllLegacy() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return this.attachUsers(logs);
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    if (!wantsPagination(q)) {
      const logs = await this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
      return this.attachUsers(logs);
    }
    const res = await paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.auditLog.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.auditLog.findMany({ where: undefined, orderBy: { createdAt: 'desc' }, skip, take }),
    });
    return {
      ...res,
      data: await this.attachUsers(res.data),
    };
  }
}
