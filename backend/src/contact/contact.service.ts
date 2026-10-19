import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateContactDto } from './contact.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubmission(dto: CreateContactDto, ipAddress: string) {
    return this.prisma.contactSubmission.create({
      data: {
        name: dto.name,
        email: dto.email,
        message: dto.message,
        ipAddress: ipAddress,
      },
    });
  }

  async findAllLegacy() {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    if (!wantsPagination(q)) {
      return this.prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.contactSubmission.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.contactSubmission.findMany({ where: undefined, orderBy: { createdAt: 'desc' }, skip, take }),
    });
  }

  async deleteSubmission(id: string) {
    return this.prisma.contactSubmission.delete({
      where: { id },
    });
  }
}
