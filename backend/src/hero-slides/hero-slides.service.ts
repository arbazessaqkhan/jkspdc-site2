import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HeroSlidesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findActive() {
    return this.prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  async findById(id: string) {
    return this.prisma.heroSlide.findUnique({ where: { id } });
  }

  async create(data: { title: string; subtitle?: string; imageUrl: string; ctaText?: string; ctaHref?: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.heroSlide.create({ data: { ...data, sortOrder: data.sortOrder || 0 } });
  }

  async update(id: string, data: { title?: string; subtitle?: string; imageUrl?: string; ctaText?: string; ctaHref?: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.heroSlide.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.heroSlide.delete({ where: { id } });
  }
}
