import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { CreatePolicyDto, UpdatePolicyDto } from './policies.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class PoliciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAllLegacy(category?: string) {
    return this.prisma.policyDocument.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}, category?: string): Promise<any> {
    const where = category ? { category } : undefined;
    if (!wantsPagination(q)) {
      return this.prisma.policyDocument.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.policyDocument.count({ where }),
      find: (skip, take) =>
        this.prisma.policyDocument.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.policyDocument.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return doc;
  }

  async create(data: CreatePolicyDto, user: any, ip: string, ua: string) {
    const { title, description, category, documentUrl, status } = data;

    const doc = await this.prisma.policyDocument.create({
      data: {
        title,
        description: description || null,
        category,
        documentUrl,
        status: status || 'Active',
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'POLICY_CREATE',
      ip,
      ua,
      { policyId: doc.id, title: doc.title, category: doc.category }
    );

    return doc;
  }

  async update(id: string, data: UpdatePolicyDto, user: any, ip: string, ua: string) {
    const oldDoc = await this.findOne(id);

    if (data.documentUrl !== undefined && data.documentUrl !== oldDoc.documentUrl) {
      deleteLocalFile(oldDoc.documentUrl);
    }
    
    const doc = await this.prisma.policyDocument.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        documentUrl: data.documentUrl,
        status: data.status,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'POLICY_UPDATE',
      ip,
      ua,
      { policyId: doc.id, title: doc.title, category: doc.category }
    );

    return doc;
  }

  async remove(id: string, user: any, ip: string, ua: string) {
    const doc = await this.findOne(id);
    deleteLocalFile(doc.documentUrl);
    
    await this.prisma.policyDocument.delete({ where: { id } });

    await this.auditLogsService.log(
      user.userId,
      'POLICY_DELETE',
      ip,
      ua,
      { policyId: doc.id, title: doc.title, category: doc.category }
    );

    return { success: true };
  }
}
