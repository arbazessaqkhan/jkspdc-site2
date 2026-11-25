import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDownloadDto, UpdateDownloadDto } from './downloads.dto';
import { wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class DownloadsService {
  constructor(private prisma: PrismaService) {}

  async findAllLegacy(category?: string) {
    return this.prisma.download.findMany({
      where: category ? { category } : undefined,
      orderBy: { publishDate: 'desc' },
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: any = {}, category?: string): Promise<any> {
    const where: any = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    if (q.status && typeof q.status === 'string' && q.status.trim() && q.status !== 'All') {
      where.status = q.status.trim();
    }
    if (q.search && typeof q.search === 'string' && q.search.trim()) {
      where.title = { contains: q.search.trim(), mode: 'insensitive' };
    }
    if (!wantsPagination(q)) {
      return this.prisma.download.findMany({ where, orderBy: { publishDate: 'desc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.download.count({ where }),
      find: (skip, take) =>
        this.prisma.download.findMany({ where, orderBy: { publishDate: 'desc' }, skip, take }),
    });
  }

  async findById(id: string) {
    return this.prisma.download.findUnique({ where: { id } });
  }

  async create(data: CreateDownloadDto) {
    return this.prisma.download.create({ data: { ...data, fileSizeBytes: data.fileSizeBytes || 0 } });
  }

  async update(id: string, data: UpdateDownloadDto) {
    return this.prisma.download.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.download.delete({ where: { id } });
  }
}
