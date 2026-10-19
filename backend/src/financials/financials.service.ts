import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFinancialDto, UpdateFinancialDto } from './financials.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class FinancialsService {
  constructor(private prisma: PrismaService) {}

  async findAllLegacy() {
    return this.prisma.financialDocument.findMany({ orderBy: { publishDate: 'desc' } });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    if (!wantsPagination(q)) {
      return this.prisma.financialDocument.findMany({ orderBy: { publishDate: 'desc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.financialDocument.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.financialDocument.findMany({ where: undefined, orderBy: { publishDate: 'desc' }, skip, take }),
    });
  }

  async findById(id: string) {
    return this.prisma.financialDocument.findUnique({ where: { id } });
  }

  async findByCategory(category: string) {
    return this.prisma.financialDocument.findMany({ where: { category }, orderBy: { publishDate: 'desc' } });
  }

  async create(data: CreateFinancialDto) {
    return this.prisma.financialDocument.create({ data });
  }

  async update(id: string, data: UpdateFinancialDto) {
    return this.prisma.financialDocument.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.financialDocument.delete({ where: { id } });
  }
}
