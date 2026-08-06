import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FinancialsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.financialDocument.findMany({ orderBy: { publishDate: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.financialDocument.findUnique({ where: { id } });
  }

  async findByCategory(category: string) {
    return this.prisma.financialDocument.findMany({ where: { category }, orderBy: { publishDate: 'desc' } });
  }

  async create(data: { title: string; category: string; fiscalYear?: string; documentUrl: string; fileName: string }) {
    return this.prisma.financialDocument.create({ data });
  }

  async update(id: string, data: { title?: string; category?: string; fiscalYear?: string; documentUrl?: string; fileName?: string }) {
    return this.prisma.financialDocument.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.financialDocument.delete({ where: { id } });
  }
}
