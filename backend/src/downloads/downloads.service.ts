import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DownloadsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.download.findMany({ orderBy: { publishDate: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.download.findUnique({ where: { id } });
  }

  async create(data: { title: string; category: string; fileName: string; documentUrl: string; fileSizeBytes?: number; status?: string }) {
    return this.prisma.download.create({ data: { ...data, fileSizeBytes: data.fileSizeBytes || 0 } });
  }

  async update(id: string, data: { title?: string; category?: string; fileName?: string; documentUrl?: string; fileSizeBytes?: number; status?: string }) {
    return this.prisma.download.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.download.delete({ where: { id } });
  }
}
