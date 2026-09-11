import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OfficialContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.officialContact.findMany({
      where: { isActive: true },
      orderBy: { viewOrder: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.officialContact.findMany({
      orderBy: { viewOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.officialContact.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Official Contact with ID ${id} not found`);
    }
    return record;
  }

  async create(data: {
    name: string;
    position: string;
    email?: string;
    srinagarPhone?: string;
    srinagarFax?: string;
    jammuPhone?: string;
    jammuFax?: string;
    viewOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.officialContact.create({
      data: {
        name: data.name,
        position: data.position,
        email: data.email || null,
        srinagarPhone: data.srinagarPhone || null,
        srinagarFax: data.srinagarFax || null,
        jammuPhone: data.jammuPhone || null,
        jammuFax: data.jammuFax || null,
        viewOrder: data.viewOrder !== undefined ? Number(data.viewOrder) : 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.officialContact.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        position: data.position !== undefined ? data.position : undefined,
        email: data.email !== undefined ? data.email : undefined,
        srinagarPhone: data.srinagarPhone !== undefined ? data.srinagarPhone : undefined,
        srinagarFax: data.srinagarFax !== undefined ? data.srinagarFax : undefined,
        jammuPhone: data.jammuPhone !== undefined ? data.jammuPhone : undefined,
        jammuFax: data.jammuFax !== undefined ? data.jammuFax : undefined,
        viewOrder: data.viewOrder !== undefined ? Number(data.viewOrder) : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.officialContact.delete({
      where: { id },
    });
  }
}
