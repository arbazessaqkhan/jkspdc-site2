import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDirectorDto, UpdateDirectorDto } from './directors.dto';

@Injectable()
export class DirectorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.director.findMany({
      orderBy: { sNo: 'asc' },
    });
  }

  async findOne(id: string) {
    const director = await this.prisma.director.findUnique({
      where: { id },
    });
    if (!director) {
      throw new NotFoundException(`Director with ID ${id} not found`);
    }
    return director;
  }

  async create(data: CreateDirectorDto) {
    const { name, position, role, sNo, description } = data;

    return this.prisma.director.create({
      data: {
        name,
        position,
        role,
        sNo: Number(sNo),
        description: description || null,
      },
    });
  }

  async update(id: string, data: UpdateDirectorDto) {
    await this.findOne(id);

    return this.prisma.director.update({
      where: { id },
      data: {
        name: data.name,
        position: data.position,
        role: data.role,
        sNo: data.sNo !== undefined ? Number(data.sNo) : undefined,
        description: data.description !== undefined ? data.description : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.director.delete({
      where: { id },
    });
  }
}
