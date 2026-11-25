import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { CreateAgmDto, UpdateAgmDto } from './agm.dto';
import { wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class AgmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAllLegacy() {
    return this.prisma.agmDocument.findMany({
      orderBy: { meetingDate: 'desc' },
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: any = {}): Promise<any> {
    const where: any = {};
    if (q.search && typeof q.search === 'string' && q.search.trim()) {
      const term = q.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { fileName: { contains: term, mode: 'insensitive' } },
      ];
    }
    if (q.year && typeof q.year === 'string' && /^\d{4}$/.test(q.year.trim())) {
      const y = parseInt(q.year.trim(), 10);
      where.meetingDate = {
        gte: new Date(`${y}-01-01T00:00:00.000Z`),
        lt: new Date(`${y + 1}-01-01T00:00:00.000Z`),
      };
    }
    if (!wantsPagination(q)) {
      return this.prisma.agmDocument.findMany({ where, orderBy: { meetingDate: 'desc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.agmDocument.count({ where }),
      find: (skip, take) =>
        this.prisma.agmDocument.findMany({ where, orderBy: { meetingDate: 'desc' }, skip, take }),
    });
  }

  async findOne(id: string) {
    const agm = await this.prisma.agmDocument.findUnique({ where: { id } });
    if (!agm) {
      throw new NotFoundException(`AGM Document with ID ${id} not found`);
    }
    return agm;
  }

  async create(data: CreateAgmDto, user: any, ip: string, ua: string) {
    const { title, meetingDate, fileName, documentUrl } = data;

    const agm = await this.prisma.agmDocument.create({
      data: {
        title,
        meetingDate: new Date(meetingDate),
        fileName,
        documentUrl,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'AGM_DOCUMENT_CREATE',
      ip,
      ua,
      { agmId: agm.id, title: agm.title }
    );

    return agm;
  }

  async update(id: string, data: UpdateAgmDto, user: any, ip: string, ua: string) {
    const oldAgm = await this.findOne(id);

    if (data.documentUrl !== undefined && data.documentUrl !== oldAgm.documentUrl) {
      deleteLocalFile(oldAgm.documentUrl);
    }
    
    const agm = await this.prisma.agmDocument.update({
      where: { id },
      data: {
        title: data.title,
        meetingDate: data.meetingDate ? new Date(data.meetingDate) : undefined,
        fileName: data.fileName,
        documentUrl: data.documentUrl,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'AGM_DOCUMENT_UPDATE',
      ip,
      ua,
      { agmId: agm.id, title: agm.title }
    );

    return agm;
  }

  async remove(id: string, user: any, ip: string, ua: string) {
    const agm = await this.findOne(id);
    deleteLocalFile(agm.documentUrl);
    
    await this.prisma.agmDocument.delete({ where: { id } });

    await this.auditLogsService.log(
      user.userId,
      'AGM_DOCUMENT_DELETE',
      ip,
      ua,
      { agmId: agm.id, title: agm.title }
    );

    return { success: true };
  }
}
