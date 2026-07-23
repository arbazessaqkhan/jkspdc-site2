import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';

@Injectable()
export class CareersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll() {
    return this.prisma.career.findMany({
      orderBy: { publishDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const career = await this.prisma.career.findUnique({ where: { id } });
    if (!career) {
      throw new NotFoundException(`Career vacancy with ID ${id} not found`);
    }
    return career;
  }

  async create(data: any, user: any, ip: string, ua: string) {
    const { advertisementNo, title, description, closingDate, documentUrl, fileSizeBytes, status } = data;
    if (!advertisementNo || !title || !closingDate || !documentUrl) {
      throw new Error('Missing required fields');
    }

    const career = await this.prisma.career.create({
      data: {
        advertisementNo,
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
      'CAREER_CREATE',
      ip,
      ua,
      { careerId: career.id, advertisementNo: career.advertisementNo, title: career.title }
    );

    return career;
  }

  async update(id: string, data: any, user: any, ip: string, ua: string) {
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
        fileSizeBytes: data.fileSizeBytes !== undefined ? parseInt(data.fileSizeBytes, 10) : undefined,
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
