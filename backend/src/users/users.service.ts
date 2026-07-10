import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(data: any, currentUser: any, ip: string, ua: string) {
    const { email, password, name, role, isActive } = data;
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    const hashedPassword = this.hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'VIEWER',
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    await this.auditLogsService.log(
      currentUser.userId,
      'USER_CREATE',
      ip,
      ua,
      { createdUserId: user.id, email: user.email, name: user.name, role: user.role }
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async update(id: string, data: any, currentUser: any, ip: string, ua: string) {
    await this.findOne(id);
    
    let hashedPassword;
    if (data.password) {
      hashedPassword = this.hashPassword(data.password);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        password: hashedPassword ? hashedPassword : undefined,
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      },
    });

    await this.auditLogsService.log(
      currentUser.userId,
      'USER_UPDATE',
      ip,
      ua,
      { updatedUserId: user.id, email: user.email, role: user.role }
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async remove(id: string, currentUser: any, ip: string, ua: string) {
    const user = await this.findOne(id);
    if (user.email === 'admin@jkspdc.co.in') {
      throw new Error('Cannot delete the primary system administrator account');
    }

    await this.prisma.user.delete({ where: { id } });

    await this.auditLogsService.log(
      currentUser.userId,
      'USER_DELETE',
      ip,
      ua,
      { deletedUserId: user.id, email: user.email }
    );

    return { success: true };
  }
}
