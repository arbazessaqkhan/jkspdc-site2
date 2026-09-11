import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContactSubOfficesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.contactSubOffice.findMany({
      where: { isActive: true },
      orderBy: { viewOrder: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.contactSubOffice.findMany({
      orderBy: { viewOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.contactSubOffice.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Contact Sub-Office with ID ${id} not found`);
    }
    return record;
  }

  async create(data: {
    name: string;
    designation: string;
    email?: string;
    phone?: string;
    wing: string;
    address?: string;
    viewOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.contactSubOffice.create({
      data: {
        name: data.name,
        designation: data.designation,
        email: data.email || null,
        phone: data.phone || null,
        wing: data.wing,
        address: data.address || null,
        viewOrder: data.viewOrder !== undefined ? Number(data.viewOrder) : 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.contactSubOffice.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        designation: data.designation !== undefined ? data.designation : undefined,
        email: data.email !== undefined ? data.email : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        wing: data.wing !== undefined ? data.wing : undefined,
        address: data.address !== undefined ? data.address : undefined,
        viewOrder: data.viewOrder !== undefined ? Number(data.viewOrder) : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contactSubOffice.delete({
      where: { id },
    });
  }
}
