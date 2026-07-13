import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateTenderDto, UpdateTenderDto } from './tenders.dto';
import { Tender } from '@prisma/client';

@Injectable()
export class TendersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(): Promise<Tender[]> {
    return this.prisma.tender.findMany({
      orderBy: { publishDate: 'desc' },
    });
  }

  async findOne(id: string): Promise<Tender> {
    const tender = await this.prisma.tender.findUnique({ where: { id } });
    if (!tender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }
    return tender;
  }

  async create(data: CreateTenderDto, user: { userId: string }, ip: string, ua: string): Promise<Tender> {
    const { referenceNo, title, description, documentType, workCategory, locationTag, closingDate, bidOpeningDate, documentUrl, fileSizeBytes, status, corrigendums } = data;
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
        fileSizeBytes: fileSizeBytes ? parseInt(fileSizeBytes.toString(), 10) : 0,
        status: status || 'Active',
        corrigendums: corrigendums ? JSON.parse(JSON.stringify(corrigendums)) : [],
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

  async update(id: string, data: UpdateTenderDto, user: { userId: string }, ip: string, ua: string): Promise<Tender> {
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
        fileSizeBytes: data.fileSizeBytes !== undefined ? parseInt(data.fileSizeBytes.toString(), 10) : undefined,
        status: data.status,
        corrigendums: data.corrigendums ? JSON.parse(JSON.stringify(data.corrigendums)) : undefined,
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

  async remove(id: string, user: { userId: string }, ip: string, ua: string): Promise<{ success: boolean }> {
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
