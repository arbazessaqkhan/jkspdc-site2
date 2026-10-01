import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDownloadDto, UpdateDownloadDto } from './downloads.dto';

@Injectable()
export class DownloadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.download.findMany({
      where: category ? { category } : undefined,
      orderBy: { publishDate: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.download.findUnique({ where: { id } });
  }

  async create(data: CreateDownloadDto) {
    return this.prisma.download.create({ data: { ...data, fileSizeBytes: data.fileSizeBytes || 0 } });
  }

  async update(id: string, data: UpdateDownloadDto) {
    return this.prisma.download.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.download.delete({ where: { id } });
  }
}
