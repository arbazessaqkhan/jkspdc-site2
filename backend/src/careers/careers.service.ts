import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { CreateCareerDto, UpdateCareerDto } from './careers.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class CareersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAllLegacy() {
    return this.prisma.career.findMany({
      orderBy: { publishDate: 'desc' },
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    if (!wantsPagination(q)) {
      return this.prisma.career.findMany({ orderBy: { publishDate: 'desc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.career.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.career.findMany({ where: undefined, orderBy: { publishDate: 'desc' }, skip, take }),
    });
  }

  async findOne(id: string) {
    const career = await this.prisma.career.findUnique({ where: { id } });
    if (!career) {
      throw new NotFoundException(`Career vacancy with ID ${id} not found`);
    }
    return career;
  }

  async create(data: CreateCareerDto, user: any, ip: string, ua: string) {
    const { advertisementNo, title, description, closingDate, documentUrl, fileSizeBytes, status } = data;

    const career = await this.prisma.career.create({
      data: {
        advertisementNo,
        title,
        description: description || null,
        closingDate: new Date(closingDate),
        documentUrl,
        fileSizeBytes: fileSizeBytes ? Number(fileSizeBytes) : 0,
        status: status || 'Active',
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'CAREER_CREATE',
      ip,
      ua,
      { careerId: career.id, advertisementNo: career.advertisementNo, title: career.title }
    );

    return career;
  }

  async update(id: string, data: UpdateCareerDto, user: any, ip: string, ua: string) {
    const oldCareer = await this.findOne(id);

    if (data.documentUrl !== undefined && data.documentUrl !== oldCareer.documentUrl) {
      deleteLocalFile(oldCareer.documentUrl);
    }
    
    const career = await this.prisma.career.update({
      where: { id },
      data: {
        advertisementNo: data.advertisementNo,
        title: data.title,
        description: data.description,
        closingDate: data.closingDate ? new Date(data.closingDate) : undefined,
        documentUrl: data.documentUrl,
        fileSizeBytes: data.fileSizeBytes !== undefined ? Number(data.fileSizeBytes) : undefined,
        status: data.status,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'CAREER_UPDATE',
      ip,
      ua,
      { careerId: career.id, advertisementNo: career.advertisementNo }
    );

    return career;
  }

  async remove(id: string, user: any, ip: string, ua: string) {
    const career = await this.findOne(id);
    deleteLocalFile(career.documentUrl);
    
    await this.prisma.career.delete({ where: { id } });

    await this.auditLogsService.log(
      user.userId,
      'CAREER_DELETE',
      ip,
      ua,
      { careerId: career.id, advertisementNo: career.advertisementNo }
    );

    return { success: true };
  }
}
