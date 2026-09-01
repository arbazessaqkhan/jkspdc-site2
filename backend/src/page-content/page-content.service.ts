import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PageContentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pageContent.findMany({ orderBy: { pageSlug: 'asc' } });
  }

  async findBySlug(slug: string) {
    return this.prisma.pageContent.findUnique({ where: { pageSlug: slug } });
  }

  async upsert(slug: string, data: { title: string; content: string; metaDesc?: string; imageUrl?: string }) {
    return this.prisma.pageContent.upsert({
      where: { pageSlug: slug },
      update: { title: data.title, content: data.content, metaDesc: data.metaDesc, imageUrl: data.imageUrl },
      create: { pageSlug: slug, title: data.title, content: data.content, metaDesc: data.metaDesc, imageUrl: data.imageUrl },
    });
  }

  async delete(slug: string) {
    return this.prisma.pageContent.delete({ where: { pageSlug: slug } });
  }
}
