import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateTenderDto, UpdateTenderDto } from './tenders.dto';
import { Tender } from '@prisma/client';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { wantsPagination, paginate } from '../common/pagination';
import { detectFileFormat } from '../common/file-format.helper';

@Injectable()
export class TendersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private formatTender(tender: Tender | null): any {
    if (!tender) return tender;
    let corrs: any[] = [];
    if (tender.corrigendums) {
      if (Array.isArray(tender.corrigendums)) {
        corrs = tender.corrigendums;
      } else if (typeof tender.corrigendums === 'string') {
        try {
          corrs = JSON.parse(tender.corrigendums);
        } catch (e) {
          corrs = [];
        }
      }
    }
    return {
      ...tender,
      corrigendums: corrs,
    };
  }

  async findAllLegacy(): Promise<any[]> {
    const tenders = await this.prisma.tender.findMany({
      orderBy: { publishDate: 'desc' },
    });
    return tenders.map((t) => this.formatTender(t));
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: any = {}): Promise<any> {
    const where: any = {};
    if (q.status && typeof q.status === 'string' && q.status.trim() && q.status !== 'All') {
      if (q.status === 'Archived' || q.status === 'Archive') {
        where.status = { in: ['Archived', 'Archive'] };
      } else {
        where.status = q.status.trim();
      }
    }
    if (q.documentType && typeof q.documentType === 'string' && q.documentType.trim() && q.documentType !== 'All') {
      where.documentType = q.documentType.trim();
    }
    if (q.workCategory && typeof q.workCategory === 'string' && q.workCategory.trim() && q.workCategory !== 'All') {
      where.workCategory = q.workCategory.trim();
    }
    if (q.search && typeof q.search === 'string' && q.search.trim()) {
      const term = q.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { referenceNo: { contains: term, mode: 'insensitive' } },
        { locationTag: { contains: term, mode: 'insensitive' } },
      ];
    }
    if (!wantsPagination(q)) {
      return (await this.prisma.tender.findMany({ where, orderBy: { publishDate: 'desc' } })).map((t) => this.formatTender(t));
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.tender.count({ where }),
      find: async (skip, take) =>
        (await this.prisma.tender.findMany({ where, orderBy: { publishDate: 'desc' }, skip, take })).map((t) => this.formatTender(t)),
    });
  }

  async findOne(id: string): Promise<any> {
    const tender = await this.prisma.tender.findUnique({ where: { id } });
    if (!tender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }
    return this.formatTender(tender);
  }

  async create(data: CreateTenderDto, user: { userId: string }, ip: string, ua: string): Promise<any> {
    const { referenceNo, title, description, documentType, workCategory, locationTag, closingDate, bidOpeningDate, documentUrl, fileSizeBytes, fileFormat, status, showInTicker, priority, corrigendums } = data;
    if (!referenceNo || !title || !documentUrl) {
      throw new Error('Missing required fields');
    }

    const serializedCorrs = corrigendums !== undefined
      ? (typeof corrigendums === 'string' ? corrigendums : JSON.stringify(corrigendums))
      : null;

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
        fileFormat: fileFormat || detectFileFormat(documentUrl),
        status: status || 'Active',
        showInTicker: showInTicker !== undefined ? showInTicker : documentType === 'CORRIGENDUM',
        priority: priority || 'Normal',
        corrigendums: serializedCorrs,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'TENDER_CREATE',
      ip,
      ua,
      { tenderId: tender.id, referenceNo: tender.referenceNo, title: tender.title }
    );

    return this.formatTender(tender);
  }

  async update(id: string, data: UpdateTenderDto, user: { userId: string }, ip: string, ua: string): Promise<any> {
    const oldTender = await this.findOne(id);

    // Cleanup main document file if changed
    if (data.documentUrl !== undefined && data.documentUrl !== oldTender.documentUrl) {
      deleteLocalFile(oldTender.documentUrl);
    }

    // Cleanup deleted corrigenda files
    if (data.corrigendums !== undefined) {
      try {
        const oldCorrigendums = Array.isArray(oldTender.corrigendums)
          ? oldTender.corrigendums
          : (oldTender.corrigendums ? JSON.parse(oldTender.corrigendums) : []);
        const newCorrigendums = typeof data.corrigendums === 'string' ? JSON.parse(data.corrigendums) : data.corrigendums;
        if (Array.isArray(oldCorrigendums) && Array.isArray(newCorrigendums)) {
          const newUrls = new Set(newCorrigendums.map((c: any) => c.documentUrl).filter(Boolean));
          oldCorrigendums.forEach((c: any) => {
            if (c.documentUrl && !newUrls.has(c.documentUrl)) {
              deleteLocalFile(c.documentUrl);
            }
          });
        }
      } catch (e) {
        console.error('Error cleaning up corrigendums during update:', e);
      }
    }

    const serializedCorrs = data.corrigendums !== undefined
      ? (typeof data.corrigendums === 'string' ? data.corrigendums : JSON.stringify(data.corrigendums))
      : undefined;

    const tender = await this.prisma.tender.update({
      where: { id },
      data: {
        referenceNo: data.referenceNo,
        title: data.title,
        description: data.description,
        documentType: data.documentType,
        workCategory: data.workCategory,
        locationTag: data.locationTag,
        closingDate: data.closingDate !== undefined ? (data.closingDate ? new Date(data.closingDate) : null) : undefined,
        bidOpeningDate: data.bidOpeningDate ? new Date(data.bidOpeningDate) : null,
        documentUrl: data.documentUrl,
        fileSizeBytes: data.fileSizeBytes !== undefined ? parseInt(data.fileSizeBytes.toString(), 10) : undefined,
        fileFormat: data.fileFormat !== undefined
          ? data.fileFormat
          : (data.documentUrl !== undefined ? detectFileFormat(data.documentUrl) : undefined),
        status: data.status,
        showInTicker: data.showInTicker,
        priority: data.priority,
        corrigendums: serializedCorrs,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'TENDER_UPDATE',
      ip,
      ua,
      { tenderId: tender.id, referenceNo: tender.referenceNo }
    );

    return this.formatTender(tender);
  }

  async remove(id: string, user: { userId: string }, ip: string, ua: string): Promise<{ success: boolean }> {
    const tender = await this.findOne(id);
    
    // Delete main file
    deleteLocalFile(tender.documentUrl);

    // Delete all associated corrigenda files
    if (tender.corrigendums) {
      try {
        const corrigendums = Array.isArray(tender.corrigendums)
          ? tender.corrigendums
          : JSON.parse(tender.corrigendums);
        if (Array.isArray(corrigendums)) {
          corrigendums.forEach((c: any) => {
            if (c.documentUrl) {
              deleteLocalFile(c.documentUrl);
            }
          });
        }
      } catch (e) {
        console.error('Error parsing corrigendums for delete:', e);
      }
    }

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
