import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string) {
    return this.prisma.powerStation.findMany({
      where: status ? { status } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.powerStation.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async create(data: any) {
    // Validate required fields
    const { name, type, capacityMw, status, location } = data;
    if (!name || !type || capacityMw === undefined || !status || !location) {
      throw new Error('Missing required fields');
    }

    return this.prisma.powerStation.create({
      data: {
        name,
        type,
        capacityMw: parseFloat(capacityMw),
        status,
        location,
        description: data.description || null,
        commissionedDate: data.commissionedDate ? new Date(data.commissionedDate) : null,
        configuration: data.configuration || null,
        designEnergy: data.designEnergy ? parseFloat(data.designEnergy) : null,
        yearOfCommissioning: data.yearOfCommissioning ? parseInt(data.yearOfCommissioning, 10) : null,
        sector: data.sector || null,
        basin: data.basin || null,
        salientFeatures: data.salientFeatures || null,
        documentUrl: data.documentUrl || null,
      },
    });
  }

  async update(id: string, data: any) {
    // Check if exists
    await this.findOne(id);

    return this.prisma.powerStation.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        capacityMw: data.capacityMw !== undefined ? parseFloat(data.capacityMw) : undefined,
        status: data.status,
        location: data.location,
        description: data.description,
        commissionedDate: data.commissionedDate ? new Date(data.commissionedDate) : undefined,
        configuration: data.configuration,
        designEnergy: data.designEnergy !== undefined ? (data.designEnergy ? parseFloat(data.designEnergy) : null) : undefined,
        yearOfCommissioning: data.yearOfCommissioning !== undefined ? (data.yearOfCommissioning ? parseInt(data.yearOfCommissioning, 10) : null) : undefined,
        sector: data.sector,
        basin: data.basin,
        salientFeatures: data.salientFeatures,
        documentUrl: data.documentUrl,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.powerStation.delete({
      where: { id },
    });
  }
}
