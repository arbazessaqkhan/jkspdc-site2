import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExecutivesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.executive.findMany({ orderBy: { sNo: 'asc' } });
  }

  async findById(id: string) {
    return this.prisma.executive.findUnique({ where: { id } });
  }

  async create(data: { name: string; designation: string; department?: string; phone?: string; email?: string; officeAddress?: string; sNo?: number }) {
    return this.prisma.executive.create({ data: { ...data, sNo: data.sNo || 0 } });
  }

  async update(id: string, data: { name?: string; designation?: string; department?: string; phone?: string; email?: string; officeAddress?: string; sNo?: number }) {
    return this.prisma.executive.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.executive.delete({ where: { id } });
  }
}
