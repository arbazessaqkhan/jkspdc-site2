import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './hero-slides.dto';

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

  async create(data: CreateHeroSlideDto) {
    return this.prisma.heroSlide.create({ data: { ...data, sortOrder: data.sortOrder || 0 } });
  }

  async update(id: string, data: UpdateHeroSlideDto) {
    return this.prisma.heroSlide.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.heroSlide.delete({ where: { id } });
  }
}
