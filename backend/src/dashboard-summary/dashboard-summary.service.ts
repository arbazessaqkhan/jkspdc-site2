import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface StageBreakdown {
  operational: number;
  underConstruction: number;
  upcoming: number;
}

export interface TenderPipeline {
  open: number;
  closingSoon: number;
  closed: number;
  nearestClosing: { id: string; title: string; referenceNo: string; closingDate: string | null } | null;
}

export interface ActiveAdminInfo {
  name: string;
  email: string;
  lastActiveAt: string;
}

export interface SystemTelemetry {
  uptimeSeconds: number;
  memoryMb: number;
  dbConnected: boolean;
  dbLatencyMs: number;
  totalUsers: number;
  mfaEnabledUsers: number;
  activeAdminsCount: number;
  activeAdmins: ActiveAdminInfo[];
  auditEvents24h: number;
  serverTime: string;
}

export interface DashboardSummary {
  kpis: {
    operationalProjects: number;
    openTenders: number;
    pendingApplications: number;
    totalCapacityMw: number;
    deltas: {
      operationalProjects: number;
      openTenders: number;
      pendingApplications: number;
    };
  };
  projectStages: StageBreakdown;
  tenderPipeline: TenderPipeline;
  activitySeries: { date: string; count: number }[];
  system: SystemTelemetry;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

@Injectable()
export class DashboardSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummary> {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgoPrev = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

    const dbStart = performance.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Math.max(1, Math.round(performance.now() - dbStart));

    const [
      projects,
      tenderCounts,
      nearestClosing,
      submissions,
      prevSubmissions,
      prevProjects,
      prevTenders,
      auditLogs,
      totalUsers,
      mfaEnabledUsers,
      auditEvents24h,
      activeAdminSessions,
    ] = await Promise.all([
      this.prisma.powerStation.findMany({ select: { status: true, capacityMw: true } }),
      this.prisma.tender.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.tender.findFirst({
        where: { status: 'Active', closingDate: { gt: now } },
        orderBy: { closingDate: 'asc' },
        select: { id: true, title: true, referenceNo: true, closingDate: true },
      }),
      this.prisma.contactSubmission.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.contactSubmission.count({
        where: { createdAt: { gte: fourteenDaysAgoPrev, lt: sevenDaysAgo } },
      }),
      this.prisma.powerStation.count({
        where: { status: 'Operational', createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.tender.count({
        where: { status: 'Active', createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.auditLog.findMany({
        where: { createdAt: { gte: fourteenDaysAgo } },
        select: { createdAt: true },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { mfaEnabled: true } }),
      this.prisma.auditLog.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
      this.prisma.session.findMany({
        where: {
          revokedAt: null,
          expiresAt: { gt: now },
          user: {
            isActive: true,
            role: { in: ['ADMIN', 'SUPER_ADMIN'] },
          },
        },
        select: {
          userId: true,
          lastActiveAt: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { lastActiveAt: 'desc' },
      }),
    ]);

    // Deduplicate active admin sessions by userId
    const activeAdminMap = new Map<string, ActiveAdminInfo>();
    for (const sess of activeAdminSessions) {
      if (!activeAdminMap.has(sess.userId)) {
        activeAdminMap.set(sess.userId, {
          name: sess.user.name,
          email: sess.user.email,
          lastActiveAt: sess.lastActiveAt.toISOString(),
        });
      }
    }
    const activeAdmins = Array.from(activeAdminMap.values());

    // Project stage breakdown & operational capacity
    const stageMap: StageBreakdown = { operational: 0, underConstruction: 0, upcoming: 0 };
    let totalCapacityMw = 0;
    for (const p of projects) {
      const s = (p.status || '').toLowerCase();
      if (s === 'operational') {
        stageMap.operational++;
        totalCapacityMw += Number(p.capacityMw || 0);
      } else if (s === 'under construction') stageMap.underConstruction++;
      else if (s === 'upcoming' || s === 'under development') stageMap.upcoming++;
    }

    // Tender pipeline
    const tenderStatusMap: Record<string, number> = {};
    for (const t of tenderCounts) tenderStatusMap[t.status] = t._count._all;
    const openCount = tenderStatusMap['Active'] ?? 0;
    const closedCount =
      (tenderStatusMap['Archived'] ?? 0) + (tenderStatusMap['Cancelled'] ?? 0);

    // Active tenders closing within the next 7 days
    const closingSoon = await this.prisma.tender.count({
      where: { status: 'Active', closingDate: { gt: now, lte: in7Days } },
    });

    // 14-day activity series from audit logs
    const seriesMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      seriesMap.set(dayKey(d), 0);
    }
    for (const log of auditLogs) {
      const key = dayKey(new Date(log.createdAt));
      if (seriesMap.has(key)) seriesMap.set(key, (seriesMap.get(key) || 0) + 1);
    }
    const activitySeries = Array.from(seriesMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      kpis: {
        operationalProjects: stageMap.operational,
        openTenders: openCount,
        pendingApplications: submissions,
        totalCapacityMw: Math.round(totalCapacityMw * 10) / 10,
        deltas: {
          operationalProjects: prevProjects,
          openTenders: prevTenders,
          pendingApplications: prevSubmissions,
        },
      },
      projectStages: stageMap,
      tenderPipeline: {
        open: openCount,
        closingSoon,
        closed: closedCount,
        nearestClosing: nearestClosing
          ? {
              id: nearestClosing.id,
              title: nearestClosing.title,
              referenceNo: nearestClosing.referenceNo,
              closingDate: nearestClosing.closingDate ? nearestClosing.closingDate.toISOString() : null,
            }
          : null,
      },
      activitySeries,
      system: {
        uptimeSeconds: Math.round(process.uptime()),
        memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        dbConnected: true,
        dbLatencyMs,
        totalUsers,
        mfaEnabledUsers,
        activeAdminsCount: activeAdmins.length,
        activeAdmins,
        auditEvents24h,
        serverTime: now.toISOString(),
      },
    };
  }
}
