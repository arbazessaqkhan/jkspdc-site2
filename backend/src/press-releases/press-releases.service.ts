import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { CreatePressReleaseDto, UpdatePressReleaseDto } from './press-releases.dto';

@Injectable()
export class PressReleasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll() {
    return this.prisma.pressRelease.findMany({
      orderBy: { publishDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const press = await this.prisma.pressRelease.findUnique({ where: { id } });
    if (!press) {
      throw new NotFoundException(`Press release with ID ${id} not found`);
    }
    return press;
  }

  async create(data: CreatePressReleaseDto, user: any, ip: string, ua: string) {
    const { title, content, imageUrl } = data;

    const press = await this.prisma.pressRelease.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'PRESS_RELEASE_CREATE',
      ip,
      ua,
      { pressReleaseId: press.id, title: press.title }
    );

    return press;
  }

  async update(id: string, data: UpdatePressReleaseDto, user: any, ip: string, ua: string) {
    const oldPress = await this.findOne(id);

    if (data.imageUrl !== undefined && data.imageUrl !== oldPress.imageUrl) {
      deleteLocalFile(oldPress.imageUrl);
    }
    
    const press = await this.prisma.pressRelease.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'PRESS_RELEASE_UPDATE',
      ip,
      ua,
      { pressReleaseId: press.id, title: press.title }
    );

    return press;
  }

  async remove(id: string, user: any, ip: string, ua: string) {
    const press = await this.findOne(id);
    deleteLocalFile(press.imageUrl);
    
    await this.prisma.pressRelease.delete({ where: { id } });

    await this.auditLogsService.log(
      user.userId,
      'PRESS_RELEASE_DELETE',
      ip,
      ua,
      { pressReleaseId: press.id, title: press.title }
    );

    return { success: true };
  }
}
