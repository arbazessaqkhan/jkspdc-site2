import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DignitariesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dignitary.findMany({
      orderBy: { sNo: 'asc' },
    });
  }

  async findOne(id: string) {
    const dignitary = await this.prisma.dignitary.findUnique({
      where: { id },
    });
    if (!dignitary) {
      throw new NotFoundException(`Dignitary with ID ${id} not found`);
    }
    return dignitary;
  }

  async create(data: any) {
    const { 
      name, 
      position, 
      subTitle,
      role, 
      sNo, 
      imageUrl,
      iasBatch,
      education,
      officeLocation,
      description,
      keyResponsibilities
    } = data;
    
    if (!name || !position || sNo === undefined) {
      throw new Error('Missing required fields: name, position, sNo');
    }

    return this.prisma.dignitary.create({
      data: {
        name,
        position,
        subTitle: subTitle || null,
        role: role || position || 'OFFICIAL DIGNITARY',
        sNo: parseInt(sNo, 10),
        imageUrl: imageUrl || null,
        iasBatch: iasBatch || null,
        education: education || null,
        officeLocation: officeLocation || null,
        description: description || null,
        keyResponsibilities: keyResponsibilities || null,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    return this.prisma.dignitary.update({
      where: { id },
      data: {
        name: data.name,
        position: data.position,
        subTitle: data.subTitle !== undefined ? data.subTitle : undefined,
        role: data.role !== undefined ? (data.role || data.position) : undefined,
        sNo: data.sNo !== undefined ? parseInt(data.sNo, 10) : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
        iasBatch: data.iasBatch !== undefined ? data.iasBatch : undefined,
        education: data.education !== undefined ? data.education : undefined,
        officeLocation: data.officeLocation !== undefined ? data.officeLocation : undefined,
        description: data.description !== undefined ? data.description : undefined,
        keyResponsibilities: data.keyResponsibilities !== undefined ? data.keyResponsibilities : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dignitary.delete({
      where: { id },
    });
  }
}
