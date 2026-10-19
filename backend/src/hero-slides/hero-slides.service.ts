import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './hero-slides.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class HeroSlidesService {
  constructor(private prisma: PrismaService) {}

  async findAllLegacy() {
    return this.prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    if (!wantsPagination(q)) {
      return this.prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.heroSlide.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.heroSlide.findMany({ where: undefined, orderBy: { sortOrder: 'asc' }, skip, take }),
    });
  }

  async findActive() {
    return this.prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  async findById(id: string) {
    return this.prisma.heroSlide.findUnique({ where: { id } });
  }

  async create(data: CreateHeroSlideDto) {
    return this.prisma.heroSlide.create({ data: { ...data, sortOrder: data.sortOrder || 0 } });
  }

  async update(id: string, data: UpdateHeroSlideDto) {
    return this.prisma.heroSlide.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.heroSlide.delete({ where: { id } });
  }
}
