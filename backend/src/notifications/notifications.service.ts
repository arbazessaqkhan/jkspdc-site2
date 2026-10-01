import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { deleteLocalFile } from '../upload/file-cleanup.helper';
import { CreateNotificationDto, UpdateNotificationDto } from './notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: { publishDate: 'desc' },
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
    const { title, fileName, documentUrl, publishDate } = data;

    const notification = await this.prisma.notification.create({
      data: {
        title,
        fileName,
        documentUrl,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
      },
    });

    await this.auditLogsService.log(
      user.userId,
      'NOTIFICATION_CREATE',
      ip,
      ua,
      { notificationId: notification.id, title: notification.title }
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
