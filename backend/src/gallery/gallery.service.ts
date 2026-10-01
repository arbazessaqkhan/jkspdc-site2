import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { CreateGalleryItemDto, UpdateGalleryItemDto } from './gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll() {
    return this.prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.galleryItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Gallery item with ID ${id} not found`);
    }
    return item;
  }

  async create(data: CreateGalleryItemDto, user: any, ip: string, ua: string) {
    const { title, imageUrl, partition } = data;

    const item = await this.prisma.galleryItem.create({
      data: {
        title,
        imageUrl,
        partition: partition || '',
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'GALLERY_ITEM_CREATE',
      ip,
      ua,
      { galleryItemId: item.id, title: item.title, partition: item.partition }
    );

    return item;
  }

  async update(id: string, data: UpdateGalleryItemDto, user: any, ip: string, ua: string) {
    const oldItem = await this.findOne(id);

    if (data.imageUrl !== undefined && data.imageUrl !== oldItem.imageUrl) {
      deleteLocalFile(oldItem.imageUrl);
    }
    
    const item = await this.prisma.galleryItem.update({
      where: { id },
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        partition: data.partition || '',
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'GALLERY_ITEM_UPDATE',
      ip,
      ua,
      { galleryItemId: item.id, title: item.title, partition: item.partition }
    );

    return item;
  }

  async remove(id: string, user: any, ip: string, ua: string) {
    const item = await this.findOne(id);
    deleteLocalFile(item.imageUrl);
    
    await this.prisma.galleryItem.delete({ where: { id } });

    await this.auditLogsService.log(
      user.userId,
      'GALLERY_ITEM_DELETE',
      ip,
      ua,
      { galleryItemId: item.id, title: item.title, partition: item.partition }
    );

    return { success: true };
  }
}
