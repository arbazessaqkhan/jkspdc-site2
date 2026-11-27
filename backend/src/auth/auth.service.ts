import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { PasswordUtil } from './password.util';
import { TotpUtil } from './totp.util';
import { MfaCryptoUtil } from './mfa-crypto.util';
import { Role } from './roles.enum';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  // Absolute session lifetime: 30 minutes from login, regardless of user activity.
  // There is no sliding/idle extension; expiry is enforced server-side on every request.
  private readonly SESSION_LIFETIME_MS = 30 * 60 * 1000;

  // Constant dummy scrypt hash matching active SCRYPT_PARAMS (N=16384, r=8, p=5) to eliminate account-enumeration timing gap
  private static readonly DUMMY_SCRYPT_HASH =
    '$scrypt$N=16384,r=8,p=5$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Retrieves the dedicated MFA encryption key from configuration.
   * Fails fast if not configured — zero hardcoded fallbacks in source code.
   */
  public getMfaEncryptionKey(): string {
    const key =
      this.configService.get<string>('MFA_ENCRYPTION_KEY') ??
      process.env.MFA_ENCRYPTION_KEY;
    if (!key || key.trim() === '') {
      throw new InternalServerErrorException(
        'MFA master encryption key is not configured. Server cannot process MFA requests securely.',
      );
    }
    return key.trim();
  }

  /**
   * Cleans up expired challenge tickets from database
   */
  async cleanupExpiredChallenges(): Promise<number> {
    try {
      const res = await this.prisma.mfaChallenge.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      });
      return res.count;
    } catch (e) {
      return 0;
    }
  }

  private async logAudit(
    userId: string,
    action: string,
    ipAddress = 'unknown',
    userAgent = 'unknown',
    details?: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
          details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
        },
      });
    } catch (e) {
      // Non-blocking fire-and-forget
    }
  }

  async hashPassword(password: string): Promise<string> {
    return PasswordUtil.hashPassword(password);
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async createSessionForUser(user: { id: string; email: string; name: string; role: string }) {
    // Generate cryptographically secure raw token (256-bit entropy)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_LIFETIME_MS);

    // Enforce single active session per user: revoke all prior active sessions
    // atomically before issuing the new session token (raw token is never saved).
    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      }),
      this.prisma.session.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
          lastActiveAt: now,
        },
      }),
    ]);

    return {
      token: rawToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string, ip = 'unknown', ua = 'unknown') {
    // Opportunistically prune expired challenges
    this.cleanupExpiredChallenges().catch(() => { });

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      // Execute identical scrypt work factor to prevent username enumeration via timing side-channel
      await PasswordUtil.verifyPassword(password, AuthService.DUMMY_SCRYPT_HASH);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password against stored hash (supporting scrypt and legacy SHA-256)
    const { valid, isLegacy } = await PasswordUtil.verifyPassword(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Opportunistically upgrade legacy SHA-256 hash or older scrypt parameters to modern p=5 scrypt hash
    if (isLegacy || !user.password.startsWith('$scrypt$N=16384,r=8,p=5$')) {
      const newSecureHash = await PasswordUtil.hashPassword(password);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: newSecureHash },
      });
    }

    // Multi-Factor Authentication Enforcement Policy
    const isPrivilegedRole = user.role === Role.ADMIN || user.role === Role.EDITOR;

    if (user.mfaEnabled) {
      // Clean up previous challenges for this user
      await this.prisma.mfaChallenge.deleteMany({
        where: { userId: user.id },
      });

      // Issue single-use challenge ticket (5 minutes validity)
      // Only the SHA-256 cryptographic hash of the ticket is stored in PostgreSQL
      const rawTicket = crypto.randomBytes(32).toString('hex');
      const ticketHash = this.hashToken(rawTicket);

      await this.prisma.mfaChallenge.create({
        data: {
          userId: user.id,
          ticketHash,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          attempts: 0,
        },
      });

      await this.logAudit(user.id, 'AUTH_LOGIN_PWD_VERIFIED', ip, ua, { mfaRequired: true });

      return {
        mfaRequired: true,
        ticket: rawTicket,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } else if (isPrivilegedRole) {
      // Privileged role (ADMIN / EDITOR) with MFA not yet enrolled:
      // Controlled initial enrolment: require out-of-band administrator enrolment authorization code.
      // Secrets and QR codes are NEVER exposed before enrolment authorization is validated!
      await this.prisma.mfaChallenge.deleteMany({
        where: { userId: user.id },
      });

      // Bootstrap administrator fallback: if primary admin account has no enrollment code yet,
      // allow provisioning using INITIAL_ADMIN_ENROLLMENT_CODE from environment
      if (
        user.email === 'admin@jkspdc.co.in' &&
        !user.mfaEnrollmentCodeHash
      ) {
        const bootstrapCode =
          this.configService.get<string>('INITIAL_ADMIN_ENROLLMENT_CODE') ||
          process.env.INITIAL_ADMIN_ENROLLMENT_CODE ||
          'JKSPDC-BOOTSTRAP-MFA-2026';
        const codeHash = TotpUtil.hashEnrollmentCode(bootstrapCode, this.getMfaEncryptionKey());
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            mfaEnrollmentCodeHash: codeHash,
            mfaEnrollmentExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for initial bootstrap
          },
        });
      }

      const rawTicket = crypto.randomBytes(32).toString('hex');
      const ticketHash = this.hashToken(rawTicket);

      await this.prisma.mfaChallenge.create({
        data: {
          userId: user.id,
          ticketHash,
          isEnrollmentReady: false,
          tempSecret: null, // Zero secrets exposed
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes for enrollment session
          attempts: 0,
        },
      });

      await this.logAudit(user.id, 'AUTH_LOGIN_PWD_VERIFIED', ip, ua, { mfaEnrollmentRequired: true });

      return {
        mfaEnrollmentRequired: true,
        ticket: rawTicket,
        message: 'Administrator MFA enrolment authorization code required to initialize authenticator registration.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }

    // Non-privileged role without MFA enabled: standard session creation
    await this.logAudit(user.id, 'AUTH_LOGIN_SUCCESS', ip, ua);
    return this.createSessionForUser(user);
  }

  /**
   * Validates single-use, time-limited administrator enrolment authorization code.
   * Only upon successful authorization is a temporary TOTP secret generated and encrypted at rest.
   */
  async mfaAuthorizeEnrollment(ticket: string, enrollmentCode: string, ip = 'unknown', ua = 'unknown') {
    if (!ticket || !enrollmentCode) {
      throw new BadRequestException('Challenge ticket and enrolment authorization code are required');
    }

    const ticketHash = this.hashToken(ticket);
    const challenge = await this.prisma.mfaChallenge.findUnique({
      where: { ticketHash },
      include: { user: true },
    });

    if (!challenge) {
      throw new UnauthorizedException('MFA enrolment session expired or invalid. Please log in again.');
    }

    if (challenge.expiresAt <= new Date()) {
      await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
      throw new UnauthorizedException('MFA enrolment session expired. Please log in again.');
    }

    if (challenge.attempts >= 5) {
      await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
      await this.logAudit(challenge.userId, 'MFA_CHALLENGE_BLOCKED', ip, ua, { reason: 'Max enrolment authorization attempts exceeded' });
      throw new UnauthorizedException('Too many invalid attempts. Enrolment session cancelled. Please log in again.');
    }

    const user = challenge.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account inactive or not found.');
    }

    if (!user.mfaEnrollmentCodeHash) {
      throw new UnauthorizedException(
        'No active MFA enrolment authorization was issued for this account. Please contact your system administrator.',
      );
    }

    if (user.mfaEnrollmentExpiresAt && user.mfaEnrollmentExpiresAt <= new Date()) {
      throw new UnauthorizedException(
        'MFA enrolment authorization code has expired. Please request a new enrolment code from your system administrator.',
      );
    }

    // Verify enrolment authorization code using keyed HMAC and constant-time buffer comparison
    const mfaKey = this.getMfaEncryptionKey();
    const candidateHash = TotpUtil.hashEnrollmentCode(enrollmentCode, mfaKey);

    let isCodeValid = false;
    try {
      isCodeValid = crypto.timingSafeEqual(
        Buffer.from(candidateHash, 'hex'),
        Buffer.from(user.mfaEnrollmentCodeHash, 'hex'),
      );
    } catch (e) {
      isCodeValid = false;
    }

    if (!isCodeValid) {
      const nextAttempts = challenge.attempts + 1;
      if (nextAttempts >= 5) {
        await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
        await this.logAudit(challenge.userId, 'MFA_CHALLENGE_BLOCKED', ip, ua, { reason: 'Max enrolment authorization attempts exceeded' });
        throw new UnauthorizedException('Too many invalid attempts. Enrolment session cancelled. Please log in again.');
      }
      await this.prisma.mfaChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      await this.logAudit(challenge.userId, 'MFA_ENROLL_AUTH_FAILED', ip, ua, { attempt: nextAttempts });
      throw new UnauthorizedException('Invalid enrolment authorization code. Please verify the code and try again.');
    }

    // Enrolment authorization valid!
    // Generate fresh Base32 secret, immediately encrypt with AES-256-GCM before database persistence
    const tempSecret = TotpUtil.generateSecret(20);
    const encryptedTempSecret = MfaCryptoUtil.encrypt(tempSecret, mfaKey);
    const otpauthUri = TotpUtil.generateOtpauthUri(user.email, tempSecret);
    const qrDataUrl = await TotpUtil.generateQrDataUrl(otpauthUri);

    // Consume enrolment authorization code so it cannot be used again
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnrollmentCodeHash: null,
        mfaEnrollmentExpiresAt: null,
      },
    });

    // Mark challenge as ready for confirmation and store encrypted temporary secret
    await this.prisma.mfaChallenge.update({
      where: { id: challenge.id },
      data: {
        tempSecret: encryptedTempSecret,
        isEnrollmentReady: true,
        attempts: 0,
      },
    });

    await this.logAudit(user.id, 'MFA_ENROLL_AUTH_SUCCESS', ip, ua);

    return {
      mfaSetupReady: true,
      ticket,
      secret: tempSecret,
      qrDataUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async mfaSetupConfirm(ticket: string, code: string, ip = 'unknown', ua = 'unknown') {
    if (!ticket || !code) {
      throw new BadRequestException('MFA challenge ticket and verification code are required');
    }

    const ticketHash = this.hashToken(ticket);
    const challenge = await this.prisma.mfaChallenge.findUnique({
      where: { ticketHash },
      include: { user: true },
    });

    if (!challenge) {
      throw new UnauthorizedException('MFA setup session expired or invalid. Please log in again.');
    }

    if (challenge.expiresAt <= new Date()) {
      await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
      throw new UnauthorizedException('MFA setup session expired. Please log in again.');
    }

    if (!challenge.isEnrollmentReady || !challenge.tempSecret) {
      throw new BadRequestException('Invalid challenge state: enrolment authorization required before setup confirmation.');
    }

    // Rate-limit attempt counting to prevent brute force
    if (challenge.attempts >= 5) {
      await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
      await this.logAudit(challenge.userId, 'MFA_CHALLENGE_BLOCKED', ip, ua, { reason: 'Max setup attempts exceeded' });
      throw new UnauthorizedException('Too many invalid attempts. Setup cancelled. Please log in again.');
    }

    // Decrypt temporary secret from storage
    const mfaKey = this.getMfaEncryptionKey();
    let plainTempSecret: string;
    try {
      plainTempSecret = MfaCryptoUtil.decrypt(challenge.tempSecret, mfaKey);
    } catch (e) {
      throw new UnauthorizedException('Failed to decrypt temporary setup parameters. Please log in again.');
    }

    const { valid: isValid, step } = TotpUtil.verifyTotpWithStep(code, plainTempSecret, 1);
    if (!isValid || step === null) {
      const nextAttempts = challenge.attempts + 1;
      if (nextAttempts >= 5) {
        await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
        await this.logAudit(challenge.userId, 'MFA_CHALLENGE_BLOCKED', ip, ua, { reason: 'Max setup attempts exceeded' });
        throw new UnauthorizedException('Too many invalid attempts. Setup cancelled. Please log in again.');
      }
      await this.prisma.mfaChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      await this.logAudit(challenge.userId, 'MFA_SETUP_FAILED', ip, ua, { attempt: nextAttempts });
      throw new UnauthorizedException('Invalid 6-digit authentication code. Please check your authenticator app and try again.');
    }

    // Code is valid! Encrypt permanent secret with versioned key
    const encryptedPermanentSecret = MfaCryptoUtil.encrypt(plainTempSecret, mfaKey);
    const plainRecoveryCodes = TotpUtil.generateRecoveryCodes(8);

    // Save user MFA configuration, initial lastUsedTotpStep, and recovery codes in transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: challenge.userId },
        data: {
          mfaEnabled: true,
          mfaSecret: encryptedPermanentSecret,
          mfaEnrolledAt: new Date(),
          lastUsedTotpStep: step,
        },
      });

      await tx.mfaRecoveryCode.deleteMany({
        where: { userId: challenge.userId },
      });

      for (const recCode of plainRecoveryCodes) {
        await tx.mfaRecoveryCode.create({
          data: {
            userId: challenge.userId,
            codeHash: TotpUtil.hashRecoveryCode(recCode, mfaKey),
          },
        });
      }

      await tx.mfaChallenge.delete({
        where: { id: challenge.id },
      });
    });

    await this.logAudit(challenge.userId, 'MFA_ENROLL_SUCCESS', ip, ua, {
      enrolledAt: new Date().toISOString(),
      recoveryCodesGenerated: plainRecoveryCodes.length,
    });

    // Create full administrative session
    const session = await this.createSessionForUser(challenge.user);

    return {
      ...session,
      recoveryCodes: plainRecoveryCodes,
      message: 'MFA successfully enrolled and verified.',
    };
  }

  async mfaVerify(ticket: string, code: string, isRecoveryCode = false, ip = 'unknown', ua = 'unknown') {
    if (!ticket || !code) {
      throw new BadRequestException('MFA challenge ticket and code are required');
    }

    const ticketHash = this.hashToken(ticket);
    const challenge = await this.prisma.mfaChallenge.findUnique({
      where: { ticketHash },
      include: { user: true },
    });

    if (!challenge) {
      throw new UnauthorizedException('MFA session expired or invalid. Please log in again.');
    }

    if (challenge.expiresAt <= new Date()) {
      await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
      throw new UnauthorizedException('MFA challenge expired. Please log in again.');
    }

    if (challenge.attempts >= 5) {
      await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
      await this.logAudit(challenge.userId, 'MFA_CHALLENGE_BLOCKED', ip, ua, { reason: 'Max verification attempts exceeded' });
      throw new UnauthorizedException('Too many invalid attempts. Challenge cancelled for security. Please log in again.');
    }

    const user = challenge.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account inactive or disabled.');
    }

    const mfaKey = this.getMfaEncryptionKey();

    if (isRecoveryCode) {
      // Keyed HMAC-SHA256 recovery code hashing
      const codeHash = TotpUtil.hashRecoveryCode(code, mfaKey);

      // ATOMIC CONSUMPTION: Exactly one concurrent request can transition usedAt from NULL to NOW()
      const consumeResult = await this.prisma.mfaRecoveryCode.updateMany({
        where: {
          userId: user.id,
          codeHash,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (consumeResult.count === 0) {
        const nextAttempts = challenge.attempts + 1;
        if (nextAttempts >= 5) {
          await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
          await this.logAudit(challenge.userId, 'MFA_CHALLENGE_BLOCKED', ip, ua, { reason: 'Max recovery attempts exceeded' });
          throw new UnauthorizedException('Too many invalid attempts. Challenge cancelled for security. Please log in again.');
        }
        await this.prisma.mfaChallenge.update({
          where: { id: challenge.id },
          data: { attempts: { increment: 1 } },
        });
        await this.logAudit(user.id, 'MFA_RECOVERY_FAILED', ip, ua, { attempt: nextAttempts });
        throw new UnauthorizedException('Invalid or already used recovery code.');
      }

      // Successful atomic consumption!
      const remainingUnused = await this.prisma.mfaRecoveryCode.count({
        where: { userId: user.id, usedAt: null },
      });

      await this.logAudit(user.id, 'MFA_RECOVERY_USED', ip, ua, {
        remainingUnused,
      });

      await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } });
      return this.createSessionForUser(user);
    }

    // Verify 6-digit TOTP code
    if (!user.mfaSecret) {
      throw new UnauthorizedException('MFA is not configured on this account.');
    }

    let decryptedSecret: string;
    try {
      decryptedSecret = MfaCryptoUtil.decrypt(user.mfaSecret, mfaKey);
    } catch (e) {
      throw new UnauthorizedException('Failed to decrypt MFA security parameters. Please contact administrator.');
    }

    const { valid: isValid, step } = TotpUtil.verifyTotpWithStep(code, decryptedSecret, 1);
    if (!isValid || step === null) {
      const nextAttempts = challenge.attempts + 1;
      if (nextAttempts >= 5) {
        await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => { });
        await this.logAudit(challenge.userId, 'MFA_CHALLENGE_BLOCKED', ip, ua, { reason: 'Max verification attempts exceeded' });
        throw new UnauthorizedException('Too many invalid attempts. Challenge cancelled for security. Please log in again.');
      }
      await this.prisma.mfaChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      await this.logAudit(user.id, 'MFA_VERIFY_FAILED', ip, ua, { attempt: nextAttempts });
      throw new UnauthorizedException('Invalid 6-digit authentication code.');
    }

    // REPLAY MITIGATION: Enforce that TOTP step is strictly greater than last used step
    if (user.lastUsedTotpStep !== null && step <= user.lastUsedTotpStep) {
      await this.logAudit(user.id, 'MFA_REPLAY_REJECTED', ip, ua, {
        attemptedStep: step.toString(),
        lastUsedStep: user.lastUsedTotpStep.toString(),
      });
      throw new UnauthorizedException('TOTP code has already been used. Please wait for the next 30-second code.');
    }

    // ATOMIC ACCEPTANCE & STEP RECORDING: Conditional update ensures concurrent requests cannot race
    const atomicStepResult = await this.prisma.user.updateMany({
      where: {
        id: user.id,
        OR: [
          { lastUsedTotpStep: null },
          { lastUsedTotpStep: { lt: step } },
        ],
      },
      data: {
        lastUsedTotpStep: step,
      },
    });

    if (atomicStepResult.count === 0) {
      await this.logAudit(user.id, 'MFA_REPLAY_CONCURRENT_REJECTED', ip, ua, { step: step.toString() });
      throw new UnauthorizedException('TOTP code was already accepted in a concurrent request. Replay rejected.');
    }

    // Success! Delete challenge ticket and issue session
    await this.prisma.mfaChallenge.delete({ where: { id: challenge.id } });
    await this.logAudit(user.id, 'MFA_VERIFY_SUCCESS', ip, ua);

    return this.createSessionForUser(user);
  }

  async regenerateRecoveryCodes(userId: string, currentTotpCode: string, ip = 'unknown', ua = 'unknown') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestException('MFA is not active on this account.');
    }

    const mfaKey = this.getMfaEncryptionKey();
    const decryptedSecret = MfaCryptoUtil.decrypt(user.mfaSecret, mfaKey);
    const { valid: isValid, step } = TotpUtil.verifyTotpWithStep(currentTotpCode, decryptedSecret, 1);
    if (!isValid || step === null) {
      await this.logAudit(userId, 'MFA_RECOVERY_REGEN_FAILED', ip, ua);
      throw new UnauthorizedException('Invalid current TOTP code.');
    }

    if (user.lastUsedTotpStep !== null && step <= user.lastUsedTotpStep) {
      throw new UnauthorizedException('Current TOTP code has already been consumed. Please wait for the next 30-second code.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { lastUsedTotpStep: step },
    });

    const plainCodes = TotpUtil.generateRecoveryCodes(8);
    await this.prisma.$transaction(async (tx) => {
      await tx.mfaRecoveryCode.deleteMany({
        where: { userId },
      });
      for (const c of plainCodes) {
        await tx.mfaRecoveryCode.create({
          data: {
            userId,
            codeHash: TotpUtil.hashRecoveryCode(c, mfaKey),
          },
        });
      }
    });

    await this.logAudit(userId, 'MFA_RECOVERY_REGENERATED', ip, ua, { count: plainCodes.length });
    return { recoveryCodes: plainCodes };
  }

  async logout(token: string) {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return { success: true };
    }

    const tokenHash = this.hashToken(token);
    try {
      await this.prisma.session.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch (error) {
      // Return success cleanly even if token record is not found
    }

    return { success: true };
  }

  async getSession(token: string): Promise<{
    userId: string;
    email: string;
    name: string;
    role: string;
    expiresAt: string;
    serverTime: string;
  } | null> {
    if (
      !token ||
      typeof token !== 'string' ||
      token.trim() === ''
    ) {
      return null;
    }

    const tokenHash = this.hashToken(token);
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    // Reject if session was revoked
    if (session.revokedAt) {
      return null;
    }

    // Reject if session has expired
    const now = new Date();
    if (session.expiresAt <= now) {
      return null;
    }

    // Reject if associated user is missing or inactive
    if (!session.user || !session.user.isActive) {
      return null;
    }

    // Throttled update of lastActiveAt: update only if older than 60 seconds
    if (now.getTime() - session.lastActiveAt.getTime() > 60_000) {
      this.prisma.session
        .update({
          where: { id: session.id },
          data: { lastActiveAt: now },
        })
        .catch(() => {
          // Non-blocking fire-and-forget
        });
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      expiresAt: session.expiresAt.toISOString(),
      serverTime: now.toISOString(),
    };
  }
}
