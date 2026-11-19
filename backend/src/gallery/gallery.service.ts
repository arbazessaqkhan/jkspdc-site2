import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { CreateGalleryItemDto, UpdateGalleryItemDto } from './gallery.dto';
import { wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAllLegacy() {
    return this.prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: any = {}): Promise<any> {
    const where: any = {};
    if (q.search && typeof q.search === 'string' && q.search.trim()) {
      where.title = { contains: q.search.trim(), mode: 'insensitive' };
    }
    if (q.projectId && typeof q.projectId === 'string' && q.projectId.trim()) {
      where.projectId = q.projectId.trim();
    }
    if (q.partition && typeof q.partition === 'string' && q.partition.trim()) {
      where.partition = q.partition.trim();
    }
    if (q.status && typeof q.status === 'string' && q.status.trim() && q.status !== 'All') {
      if (q.status === 'Archived' || q.status === 'Archive') {
        where.status = { in: ['Archived', 'Archive'] };
      } else {
        where.status = q.status.trim();
      }
    }

    if (!wantsPagination(q)) {
      return this.prisma.galleryItem.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
    }

    return paginate({
      page: q.page,
      pageSize: q.pageSize || 10,
      count: () => this.prisma.galleryItem.count({ where }),
      find: (skip, take) =>
        this.prisma.galleryItem.findMany({
          where,
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
          skip,
          take,
        }),
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
    const { title, imageUrl, partition, projectId, projectName, displayOrder, status } = data;

    const item = await this.prisma.galleryItem.create({
      data: {
        title,
        imageUrl,
        partition: partition || 'General',
        projectId: projectId || null,
        projectName: projectName || null,
        status: status || 'Active',
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'GALLERY_ITEM_CREATE',
      ip,
      ua,
      { galleryItemId: item.id, title: item.title, projectId: item.projectId, projectName: item.projectName, status: item.status }
    );

    return item;
  }

  async update(id: string, data: UpdateGalleryItemDto, user: any, ip: string, ua: string) {
    const oldItem = await this.findOne(id);

    if (data.imageUrl !== undefined && data.imageUrl !== oldItem.imageUrl) {
      deleteLocalFile(oldItem.imageUrl);
    }
    
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.partition !== undefined) updateData.partition = data.partition || 'General';
    if (data.projectId !== undefined) updateData.projectId = data.projectId || null;
    if (data.projectName !== undefined) updateData.projectName = data.projectName || null;
    if (data.displayOrder !== undefined) updateData.displayOrder = Number(data.displayOrder);

    const item = await this.prisma.galleryItem.update({
      where: { id },
      data: updateData,
    });

    await this.auditLogsService.log(
      user.userId,
      'GALLERY_ITEM_UPDATE',
      ip,
      ua,
      { galleryItemId: item.id, title: item.title, projectId: item.projectId, projectName: item.projectName }
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
