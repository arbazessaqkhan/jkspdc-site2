import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  private mapGalleryItemWithImages(item: any) {
    if (!item) return item;
    const childImages = Array.isArray(item.images) ? item.images : [];
    // If no child images exist yet, synthesize an array containing the primary/cover image
    const images = childImages.length > 0 
      ? childImages.map((img: any) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          caption: img.caption || null,
          displayOrder: img.displayOrder || 0,
        }))
      : (item.imageUrl ? [{ id: `cover-${item.id}`, imageUrl: item.imageUrl, caption: null, displayOrder: 0 }] : []);

    return {
      ...item,
      images,
      imageCount: images.length,
    };
  }

  async findAllLegacy() {
    const items = await this.prisma.galleryItem.findMany({
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.mapGalleryItemWithImages(item));
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
      const items = await this.prisma.galleryItem.findMany({
        where,
        include: {
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
      return items.map((item) => this.mapGalleryItemWithImages(item));
    }

    const paged = await paginate({
      page: q.page,
      pageSize: q.pageSize || 10,
      count: () => this.prisma.galleryItem.count({ where }),
      find: (skip, take) =>
        this.prisma.galleryItem.findMany({
          where,
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
          skip,
          take,
        }),
    });

    return {
      ...paged,
      data: paged.data.map((item: any) => this.mapGalleryItemWithImages(item)),
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.galleryItem.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
    if (!item) {
      throw new NotFoundException(`Gallery item with ID ${id} not found`);
    }
    return this.mapGalleryItemWithImages(item);
  }

  async create(data: CreateGalleryItemDto, user: any, ip: string, ua: string) {
    const { title, imageUrl, images, partition, projectId, projectName, displayOrder, status } = data;

    // Resolve list of images (supports 1 to 15 images)
    const rawImagesList: string[] = Array.isArray(images) && images.length > 0 
      ? images.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
      : (imageUrl ? [imageUrl.trim()] : []);

    if (rawImagesList.length === 0) {
      throw new BadRequestException('At least one image is required for the gallery');
    }

    const primaryImageUrl = rawImagesList[0];

    const item = await this.prisma.galleryItem.create({
      data: {
        title,
        imageUrl: primaryImageUrl,
        partition: partition || 'General',
        projectId: projectId || null,
        projectName: projectName || null,
        status: status || 'Active',
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
        images: {
          create: rawImagesList.map((url, idx) => ({
            imageUrl: url,
            displayOrder: idx,
          })),
        },
      },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'GALLERY_ITEM_CREATE',
      ip,
      ua,
      { 
        galleryItemId: item.id, 
        title: item.title, 
        projectId: item.projectId, 
        projectName: item.projectName, 
        status: item.status, 
        imageCount: rawImagesList.length 
      }
    );

    return this.mapGalleryItemWithImages(item);
  }

  async update(id: string, data: UpdateGalleryItemDto, user: any, ip: string, ua: string) {
    const oldItem = await this.findOne(id);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.partition !== undefined) updateData.partition = data.partition || 'General';
    if (data.projectId !== undefined) updateData.projectId = data.projectId || null;
    if (data.projectName !== undefined) updateData.projectName = data.projectName || null;
    if (data.displayOrder !== undefined) updateData.displayOrder = Number(data.displayOrder);

    // If new images array provided
    if (Array.isArray(data.images) && data.images.length > 0) {
      const rawImagesList = data.images.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);
      if (rawImagesList.length > 0) {
        updateData.imageUrl = rawImagesList[0];
        
        // Remove old child records and replace with new ordered list
        await this.prisma.galleryImage.deleteMany({ where: { galleryItemId: id } });
        updateData.images = {
          create: rawImagesList.map((url, idx) => ({
            imageUrl: url,
            displayOrder: idx,
          })),
        };
      }
    } else if (data.imageUrl !== undefined && data.imageUrl) {
      updateData.imageUrl = data.imageUrl;
      if (data.imageUrl !== oldItem.imageUrl) {
        deleteLocalFile(oldItem.imageUrl);
      }
    }

    const item = await this.prisma.galleryItem.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'GALLERY_ITEM_UPDATE',
      ip,
      ua,
      { galleryItemId: item.id, title: item.title, projectId: item.projectId, projectName: item.projectName }
    );

    return this.mapGalleryItemWithImages(item);
  }

  async remove(id: string, user: any, ip: string, ua: string) {
    const item = await this.findOne(id);
    if (item.imageUrl) {
      deleteLocalFile(item.imageUrl);
    }
    if (Array.isArray(item.images)) {
      item.images.forEach((img: any) => {
        if (img.imageUrl && img.imageUrl !== item.imageUrl) {
          deleteLocalFile(img.imageUrl);
        }
      });
    }
    
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
