import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PasswordUtil } from '../auth/password.util';
import { TotpUtil } from '../auth/totp.util';
import { MfaCryptoUtil } from '../auth/mfa-crypto.util';
import { Role } from '../auth/roles.enum';
import { CreateUserDto, UpdateUserDto, ResetMfaDto } from './users.dto';
import { PaginationDto, wantsPagination, paginate } from '../common/pagination';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly configService: ConfigService,
  ) {}

  private getMfaEncryptionKey(): string {
    const key =
      this.configService.get<string>('MFA_ENCRYPTION_KEY') ||
      process.env.MFA_ENCRYPTION_KEY;
    if (!key || key.trim() === '') {
      throw new InternalServerErrorException('MFA encryption key is not configured.');
    }
    return key.trim();
  }

  async hashPassword(password: string): Promise<string> {
    return PasswordUtil.hashPassword(password);
  }

  async findAllLegacy() {
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

  /**
   * Paged variant used by admin list pages (?page/?pageSize). Without
   * pagination params it returns the full array (legacy behaviour).
   */
  async findAll(q: PaginationDto = {}): Promise<any> {
    const userSelect = {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      mfaEnabled: true,
      mfaEnrolledAt: true,
      createdAt: true,
      updatedAt: true,
    };

    if (!wantsPagination(q)) {
      return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: userSelect });
    }
    return paginate({
      page: q.page,
      pageSize: q.pageSize,
      count: () => this.prisma.user.count({ where: undefined }),
      find: (skip, take) =>
        this.prisma.user.findMany({ where: undefined, orderBy: { createdAt: 'desc' }, select: userSelect, skip, take }),
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
        mfaEnabled: true,
        mfaEnrolledAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(data: CreateUserDto, currentUser: any, ip: string, ua: string) {
    const { email, password, name, role, isActive } = data;
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    const hashedPassword = await this.hashPassword(password);
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

  async update(id: string, data: UpdateUserDto, currentUser: any, ip: string, ua: string) {
    await this.findOne(id);
    
    let hashedPassword;
    if (data.password) {
      hashedPassword = await this.hashPassword(data.password);
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

    // Invalidate all active sessions if password, role, or status changes
    if (hashedPassword || data.role !== undefined || data.isActive === false) {
      await this.prisma.session.updateMany({
        where: {
          userId: id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

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

  async resetMfa(id: string, currentUser: any, data: ResetMfaDto, ip: string, ua: string) {
    if (!data || !data.currentPassword || !data.totpCode) {
      throw new BadRequestException('Current administrator password and TOTP code are required.');
    }

    const caller = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
    });
    if (!caller || !caller.isActive) {
      throw new UnauthorizedException('Requesting administrator account not found or inactive.');
    }

    // Step-up verification 1: verify requesting administrator's password
    const { valid: pwdValid } = await PasswordUtil.verifyPassword(data.currentPassword, caller.password);
    if (!pwdValid) {
      await this.auditLogsService.log(
        currentUser.userId,
        'MFA_RESET_AUTH_FAILED',
        ip,
        ua,
        { reason: 'Invalid caller password' }
      );
      throw new UnauthorizedException('Authentication failed: Invalid administrator password.');
    }

    const mfaKey = this.getMfaEncryptionKey();

    // Step-up verification 2: verify requesting administrator's TOTP code if MFA is enabled
    if (caller.mfaEnabled && caller.mfaSecret) {
      const decryptedCallerSecret = MfaCryptoUtil.decrypt(caller.mfaSecret, mfaKey);
      const { valid: totpValid, step } = TotpUtil.verifyTotpWithStep(data.totpCode, decryptedCallerSecret, 1);
      if (!totpValid || step === null) {
        await this.auditLogsService.log(
          currentUser.userId,
          'MFA_RESET_AUTH_FAILED',
          ip,
          ua,
          { reason: 'Invalid caller TOTP code' }
        );
        throw new UnauthorizedException('Authentication failed: Invalid administrator TOTP code.');
      }

      if (caller.lastUsedTotpStep !== null && step <= caller.lastUsedTotpStep) {
        throw new UnauthorizedException('Current administrator TOTP code has already been consumed. Please wait for the next 30-second code.');
      }

      await this.prisma.user.update({
        where: { id: caller.id },
        data: { lastUsedTotpStep: step },
      });
    }

    const targetUser = await this.findOne(id);

    // Controlled authorization for resetting another administrator
    if (targetUser.role === Role.ADMIN && caller.id !== targetUser.id) {
      if (!data.reason || data.reason.trim().length < 5) {
        throw new BadRequestException(
          'A detailed administrative justification is required when resetting another administrator account (minimum 5 characters).',
        );
      }
    }

    // Generate fresh single-use 24-hour Enrolment Authorization Code for target user
    const newEnrollmentCode = TotpUtil.generateEnrollmentCode();
    const enrollmentCodeHash = TotpUtil.hashEnrollmentCode(newEnrollmentCode, mfaKey);
    const enrollmentExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Transactionally reset MFA status, generate new enrolment authorization, and revoke active sessions
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          mfaEnrolledAt: null,
          lastUsedTotpStep: null,
          mfaEnrollmentCodeHash: enrollmentCodeHash,
          mfaEnrollmentExpiresAt: enrollmentExpiresAt,
        },
      });

      await tx.mfaRecoveryCode.deleteMany({
        where: { userId: id },
      });

      await tx.mfaChallenge.deleteMany({
        where: { userId: id },
      });

      // Revoke all existing sessions so account cannot be accessed until re-authenticated
      await tx.session.updateMany({
        where: {
          userId: id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    });

    await this.auditLogsService.log(
      currentUser.userId,
      'MFA_RESET_BY_ADMIN',
      ip,
      ua,
      {
        targetUserId: targetUser.id,
        targetEmail: targetUser.email,
        targetRole: targetUser.role,
        reason: data.reason || 'Administrative reset',
      }
    );

    return {
      success: true,
      enrollmentCode: newEnrollmentCode,
      expiresAt: enrollmentExpiresAt.toISOString(),
      message: `MFA has been successfully reset for ${targetUser.name} (${targetUser.email}). A single-use enrolment code has been generated. Provide this code securely out-of-band to the user.`,
    };
  }
}
