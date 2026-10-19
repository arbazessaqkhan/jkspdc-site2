import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateExecutiveDto, UpdateExecutiveDto } from './executives.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class ExecutivesService {
  constructor(private prisma: PrismaService) {}

  async findAllLegacy() {
    return this.prisma.executive.findMany({ orderBy: { sNo: 'asc' } });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    if (!wantsPagination(q)) {
      return this.prisma.executive.findMany({ orderBy: { sNo: 'asc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.executive.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.executive.findMany({ where: undefined, orderBy: { sNo: 'asc' }, skip, take }),
    });
  }

  async findById(id: string) {
    return this.prisma.executive.findUnique({ where: { id } });
  }

  async create(data: CreateExecutiveDto) {
    return this.prisma.executive.create({ data: { ...data, sNo: data.sNo || 0 } });
  }

  async update(id: string, data: UpdateExecutiveDto) {
    return this.prisma.executive.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.executive.delete({ where: { id } });
  }
}
