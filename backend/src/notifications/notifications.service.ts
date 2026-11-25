import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { CreateNotificationDto, UpdateNotificationDto } from './notifications.dto';
import { wantsPagination, paginate } from '../common/pagination';
import { detectFileFormat } from '../common/file-format.helper';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAllLegacy() {
    return this.prisma.notification.findMany({
      orderBy: { publishDate: 'desc' },
    });
  }

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: any = {}): Promise<any> {
    const where: any = {};
    if (q.status && typeof q.status === 'string' && q.status.trim() && q.status !== 'All') {
      if (q.status === 'Archived' || q.status === 'Archive') {
        where.status = { in: ['Archived', 'Archive'] };
      } else {
        where.status = q.status.trim();
      }
    }
    if (q.search && typeof q.search === 'string' && q.search.trim()) {
      const term = q.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { fileName: { contains: term, mode: 'insensitive' } },
      ];
    }
    if (!wantsPagination(q)) {
      return this.prisma.notification.findMany({ where, orderBy: { publishDate: 'desc' } });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.notification.count({ where }),
      find: (skip, take) =>
        this.prisma.notification.findMany({ where, orderBy: { publishDate: 'desc' }, skip, take }),
    });
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async create(data: CreateNotificationDto, user: any, ip: string, ua: string) {
    const { title, fileName, documentUrl, fileSizeBytes, fileFormat, validTillDate, publishDate, status, showInTicker, priority } = data;

    const notification = await this.prisma.notification.create({
      data: {
        title,
        fileName,
        documentUrl,
        fileSizeBytes: fileSizeBytes ?? null,
        fileFormat: fileFormat || detectFileFormat(documentUrl),
        validTillDate: validTillDate ? new Date(validTillDate) : null,
        status: status || 'Active',
        showInTicker: showInTicker ?? false,
        priority: priority || 'Normal',
        publishDate: publishDate ? new Date(publishDate) : new Date(),
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'NOTIFICATION_CREATE',
      ip,
      ua,
      { notificationId: notification.id, title: notification.title, status: notification.status }
    );

    return notification;
  }

  async update(id: string, data: UpdateNotificationDto, user: any, ip: string, ua: string) {
    const oldNotification = await this.findOne(id);

    if (data.documentUrl !== undefined && data.documentUrl !== oldNotification.documentUrl) {
      deleteLocalFile(oldNotification.documentUrl);
    }
    
    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        title: data.title,
        fileName: data.fileName,
        documentUrl: data.documentUrl,
        fileSizeBytes: data.fileSizeBytes !== undefined ? data.fileSizeBytes : undefined,
        fileFormat: data.fileFormat !== undefined
          ? data.fileFormat
          : (data.documentUrl !== undefined ? detectFileFormat(data.documentUrl) : undefined),
        validTillDate: data.validTillDate !== undefined ? (data.validTillDate ? new Date(data.validTillDate) : null) : undefined,
        status: data.status !== undefined ? data.status : undefined,
        showInTicker: data.showInTicker,
        priority: data.priority,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'NOTIFICATION_UPDATE',
      ip,
      ua,
      { notificationId: notification.id, title: notification.title }
    );

    return notification;
  }

  async remove(id: string, user: any, ip: string, ua: string) {
    const notification = await this.findOne(id);
    deleteLocalFile(notification.documentUrl);
    
    await this.prisma.notification.delete({ where: { id } });

    await this.auditLogsService.log(
      user.userId,
      'NOTIFICATION_DELETE',
      ip,
      ua,
      { notificationId: notification.id, title: notification.title }
    );

    return { success: true };
  }
}
