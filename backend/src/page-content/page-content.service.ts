import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class PageContentService {
  constructor(private prisma: PrismaService) {}

  async findAllLegacy() {
    return this.prisma.pageContent.findMany({ orderBy: { pageSlug: 'asc' } });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    if (!wantsPagination(q)) {
      return this.prisma.pageContent.findMany({ orderBy: { pageSlug: 'asc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.pageContent.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.pageContent.findMany({ where: undefined, orderBy: { pageSlug: 'asc' }, skip, take }),
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.pageContent.findUnique({ where: { pageSlug: slug } });
  }

  async upsert(slug: string, data: { title: string; content: string; metaDesc?: string; imageUrl?: string }) {
    return this.prisma.pageContent.upsert({
      where: { pageSlug: slug },
      update: { title: data.title, content: data.content, metaDesc: data.metaDesc, imageUrl: data.imageUrl },
      create: { pageSlug: slug, title: data.title, content: data.content, metaDesc: data.metaDesc, imageUrl: data.imageUrl },
    });
  }

  async delete(slug: string) {
    return this.prisma.pageContent.delete({ where: { pageSlug: slug } });
  }
}
