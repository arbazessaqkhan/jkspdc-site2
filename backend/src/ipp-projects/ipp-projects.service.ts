import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateIppProjectDto, UpdateIppProjectDto } from './ipp-projects.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class IppProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAllLegacy(phase?: number) {
    const where = phase ? { phase } : {};
    return this.prisma.ippProject.findMany({
      where,
      orderBy: [{ phase: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}, phase?: number): Promise<any> {
    if (!wantsPagination(q)) {
      return this.prisma.ippProject.findMany({ orderBy: [{ phase: 'asc' }, { name: 'asc' }] });
    }
    const where = phase ? { phase } : undefined;
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.ippProject.count({ where }),
      find: (skip, take) =>
        this.prisma.ippProject.findMany({ where, orderBy: [{ phase: 'asc' }, { name: 'asc' }], skip, take }),
    });
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
