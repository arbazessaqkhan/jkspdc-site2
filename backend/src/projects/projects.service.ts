import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(q: PaginationDto = {}, status?: string): Promise<any> {
    const where = status ? { status } : undefined;
    if (!wantsPagination(q)) {
      return this.prisma.powerStation.findMany({ where, orderBy: { name: 'asc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.powerStation.count({ where }),
      find: (skip, take) =>
        this.prisma.powerStation.findMany({ where, orderBy: { name: 'asc' }, skip, take }),
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

  async create(data: CreateProjectDto) {
    const { name, type, capacityMw, status, location } = data;

    return this.prisma.powerStation.create({
      data: {
        name,
        type,
        capacityMw: Number(capacityMw),
        status,
        location,
        description: data.description || null,
        commissionedDate: data.commissionedDate ? new Date(data.commissionedDate) : null,
        configuration: data.configuration || null,
        designEnergy: data.designEnergy !== undefined && data.designEnergy !== null ? Number(data.designEnergy) : null,
        yearOfCommissioning: data.yearOfCommissioning !== undefined && data.yearOfCommissioning !== null ? Number(data.yearOfCommissioning) : null,
        sector: data.sector || null,
        basin: data.basin || null,
        salientFeatures: data.salientFeatures || null,
        documentUrl: data.documentUrl || null,
      },
    });
  }

  async update(id: string, data: UpdateProjectDto) {
    // Check if exists
    const oldProject = await this.findOne(id);

    if (data.documentUrl !== undefined && data.documentUrl !== oldProject.documentUrl) {
      deleteLocalFile(oldProject.documentUrl);
    }

    return this.prisma.powerStation.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        capacityMw: data.capacityMw !== undefined ? Number(data.capacityMw) : undefined,
        status: data.status,
        location: data.location,
        description: data.description,
        commissionedDate: data.commissionedDate ? new Date(data.commissionedDate) : undefined,
        configuration: data.configuration,
        designEnergy: data.designEnergy !== undefined ? (data.designEnergy !== null ? Number(data.designEnergy) : null) : undefined,
        yearOfCommissioning: data.yearOfCommissioning !== undefined ? (data.yearOfCommissioning !== null ? Number(data.yearOfCommissioning) : null) : undefined,
        sector: data.sector,
        basin: data.basin,
        salientFeatures: data.salientFeatures,
        documentUrl: data.documentUrl,
      },
    });
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    deleteLocalFile(project.documentUrl);
    
    return this.prisma.powerStation.delete({
      where: { id },
    });
  }
}
