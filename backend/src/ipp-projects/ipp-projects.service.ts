import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateIppProjectDto, UpdateIppProjectDto } from './ipp-projects.dto';
import { wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class IppProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAllLegacy(phase?: number) {
    const where = phase ? { phase } : {};
    return this.prisma.ippProject.findMany({
      where,
      orderBy: [{ phase: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: any = {}, phase?: number): Promise<any> {
    const where: any = {};
    if (phase && !isNaN(phase)) {
      where.phase = phase;
    }
    if (q.search && typeof q.search === 'string' && q.search.trim()) {
      const term = q.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
        { awardedTo: { contains: term, mode: 'insensitive' } },
        { status: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (!wantsPagination(q)) {
      return this.prisma.ippProject.findMany({
        where,
        orderBy: [{ phase: 'asc' }, { createdAt: 'asc' }],
      });
    }

    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.ippProject.count({ where }),
      find: (skip, take) =>
        this.prisma.ippProject.findMany({ where, orderBy: [{ phase: 'asc' }, { createdAt: 'asc' }], skip, take }),
    });
  }

  async getStats() {
    const all = await this.prisma.ippProject.findMany({
      select: { capacityMw: true, status: true },
    });
    const totalProjects = all.length;
    const totalCapacityMw = all.reduce((sum, p) => sum + (Number(p.capacityMw) || 0), 0);
    const commissionedCount = all.filter((p) => (p.status || '').toLowerCase().includes('commissioned')).length;
    const inProgressCount = all.filter((p) => {
      const s = (p.status || '').toLowerCase();
      return s.includes('progress') || s.includes('construction') || s.includes('dpr') || s.includes('clearance') || s.includes('allotted');
    }).length;
    return { totalProjects, totalCapacityMw, commissionedCount, inProgressCount };
  }

  async findById(id: string) {
    return this.prisma.ippProject.findUnique({ where: { id } });
  }

  async create(data: CreateIppProjectDto) {
    return this.prisma.ippProject.create({
      data: {
        name: data.name,
        capacityMw: Number(data.capacityMw) || 0,
        status: data.status || 'Active',
        location: data.location || 'Jammu',
        awardedTo: data.awardedTo || '—',
        phase: Number(data.phase) || 1,
      },
    });
  }

  async update(id: string, data: UpdateIppProjectDto) {
    const updateData: any = { ...data };
    if (data.capacityMw !== undefined) {
      updateData.capacityMw = Number(data.capacityMw) || 0;
    }
    if (data.phase !== undefined) {
      updateData.phase = Number(data.phase) || 1;
    }
    return this.prisma.ippProject.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.ippProject.delete({ where: { id } });
  }
}
