import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDirectorDto, UpdateDirectorDto } from './directors.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class DirectorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllLegacy() {
    return this.prisma.director.findMany({
      orderBy: { sNo: 'asc' },
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    if (!wantsPagination(q)) {
      return this.prisma.director.findMany({ orderBy: { sNo: 'asc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.director.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.director.findMany({ where: undefined, orderBy: { sNo: 'asc' }, skip, take }),
    });
  }

  async findOne(id: string) {
    const director = await this.prisma.director.findUnique({
      where: { id },
    });
    if (!director) {
      throw new NotFoundException(`Director with ID ${id} not found`);
    }
    return director;
  }

  async create(data: CreateDirectorDto) {
    const { name, position, role, sNo, description } = data;

    return this.prisma.director.create({
      data: {
        name,
        position,
        role,
        sNo: Number(sNo),
        description: description || null,
      },
    });
  }

  async update(id: string, data: UpdateDirectorDto) {
    await this.findOne(id);

    return this.prisma.director.update({
      where: { id },
      data: {
        name: data.name,
        position: data.position,
        role: data.role,
        sNo: data.sNo !== undefined ? Number(data.sNo) : undefined,
        description: data.description !== undefined ? data.description : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.director.delete({
      where: { id },
    });
  }
}
