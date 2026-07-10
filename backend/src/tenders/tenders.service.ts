import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class TendersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll() {
    return this.prisma.tender.findMany({
      orderBy: { publishDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const tender = await this.prisma.tender.findUnique({ where: { id } });
    if (!tender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }
    return tender;
  }

  async create(data: any, user: any, ip: string, ua: string) {
    const { referenceNo, title, description, closingDate, documentUrl, fileSizeBytes, status } = data;
    if (!referenceNo || !title || !closingDate || !documentUrl) {
      throw new Error('Missing required fields');
    }

    const tender = await this.prisma.tender.create({
      data: {
        referenceNo,
        title,
        description: description || null,
        closingDate: new Date(closingDate),
        documentUrl,
        fileSizeBytes: fileSizeBytes ? parseInt(fileSizeBytes, 10) : 0,
        status: status || 'Active',
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'TENDER_CREATE',
      ip,
      ua,
      { tenderId: tender.id, referenceNo: tender.referenceNo, title: tender.title }
    );

    return tender;
  }

  async update(id: string, data: any, user: any, ip: string, ua: string) {
    await this.findOne(id);
    
    const tender = await this.prisma.tender.update({
      where: { id },
      data: {
        referenceNo: data.referenceNo,
        title: data.title,
        description: data.description,
        closingDate: data.closingDate ? new Date(data.closingDate) : undefined,
        documentUrl: data.documentUrl,
        fileSizeBytes: data.fileSizeBytes !== undefined ? parseInt(data.fileSizeBytes, 10) : undefined,
        status: data.status,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'TENDER_UPDATE',
      ip,
      ua,
      { tenderId: tender.id, referenceNo: tender.referenceNo }
    );

    return tender;
  }

  async remove(id: string, user: any, ip: string, ua: string) {
    const tender = await this.findOne(id);
    await this.prisma.tender.delete({ where: { id } });

    await this.auditLogsService.log(
      user.userId,
      'TENDER_DELETE',
      ip,
      ua,
      { tenderId: tender.id, referenceNo: tender.referenceNo }
    );

    return { success: true };
  }
}
