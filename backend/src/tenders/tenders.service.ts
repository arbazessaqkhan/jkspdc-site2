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
    const { referenceNo, title, description, documentType, workCategory, locationTag, closingDate, bidOpeningDate, documentUrl, fileSizeBytes, status, parentTenderId } = data;
    if (!referenceNo || !title || !documentUrl) {
      throw new Error('Missing required fields');
    }

    const tender = await this.prisma.tender.create({
      data: {
        referenceNo,
        title,
        description: description || null,
        documentType: documentType || 'NIT',
        workCategory: workCategory || 'Civil',
        locationTag: locationTag || 'HQ_SRINAGAR',
        closingDate: closingDate ? new Date(closingDate) : null,
        bidOpeningDate: bidOpeningDate ? new Date(bidOpeningDate) : null,
        documentUrl,
        fileSizeBytes: fileSizeBytes ? parseInt(fileSizeBytes, 10) : 0,
        status: status || 'Active',
        parentTenderId: parentTenderId || null,
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
        documentType: data.documentType,
        workCategory: data.workCategory,
        locationTag: data.locationTag,
        closingDate: data.closingDate ? new Date(data.closingDate) : null,
        bidOpeningDate: data.bidOpeningDate ? new Date(data.bidOpeningDate) : null,
        documentUrl: data.documentUrl,
        fileSizeBytes: data.fileSizeBytes !== undefined ? parseInt(data.fileSizeBytes, 10) : undefined,
        status: data.status,
        parentTenderId: data.parentTenderId || null,
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
