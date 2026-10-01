import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateExecutiveDto, UpdateExecutiveDto } from './executives.dto';

@Injectable()
export class ExecutivesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.executive.findMany({ orderBy: { sNo: 'asc' } });
  }

  async findById(id: string) {
    return this.prisma.executive.findUnique({ where: { id } });
  }

  async create(data: CreateExecutiveDto) {
    return this.prisma.executive.create({ data: { ...data, sNo: data.sNo || 0 } });
  }

  async update(id: string, data: UpdateExecutiveDto) {
    return this.prisma.executive.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.executive.delete({ where: { id } });
  }
}
