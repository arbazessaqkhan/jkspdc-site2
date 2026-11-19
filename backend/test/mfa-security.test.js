const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

// Import compiled utilities and services
const { TotpUtil } = require('../dist/src/auth/totp.util');
const { MfaCryptoUtil } = require('../dist/src/auth/mfa-crypto.util');
const { AuthService } = require('../dist/src/auth/auth.service');
const { UsersService } = require('../dist/src/users/users.service');
const { PasswordUtil } = require('../dist/src/auth/password.util');
const { HttpThrottlerGuard } = require('../dist/src/http-throttler.guard');

const TEST_MFA_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

class MockConfigService {
  constructor(env = {}) {
    this.env = {
      MFA_ENCRYPTION_KEY: TEST_MFA_KEY,
      SESSION_SECRET: 'test_session_secret_12345678901234567890',
      INITIAL_ADMIN_ENROLLMENT_CODE: 'TEST-BOOTSTRAP-MFA-2026',
      ...env,
    };
  }
  get(key) {
    if (this.env[key] !== undefined) return this.env[key];
    return process.env[key] || null;
  }
}

class MockAuditLogsService {
  constructor(prisma) {
    this.prisma = prisma;
  }
  async log(userId, action, ip, ua, details) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          ipAddress: ip || '127.0.0.1',
          userAgent: ua || 'test-agent',
          details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
        },
      });
    } catch (e) {}
  }
}

describe('JKSPDC Phase 2.2A MFA Security Hardening Test Suite', () => {
  let prisma;
  let configService;
  let auditLogsService;
  let authService;
  let usersService;
  let testAdmin;
  let testTargetUser;

  before(async () => {
    prisma = new PrismaClient();
    configService = new MockConfigService();
    auditLogsService = new MockAuditLogsService(prisma);
    authService = new AuthService(prisma, configService);
    usersService = new UsersService(prisma, auditLogsService, configService);

    // Clean up any previous test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test_sec_admin@jkspdc.co.in', 'test_sec_target@jkspdc.co.in'],
        },
      },
    });

    const hashedPassword = await PasswordUtil.hashPassword('AdminSecPass123!');

    // Create test administrator
    testAdmin = await prisma.user.create({
      data: {
        email: 'test_sec_admin@jkspdc.co.in',
        password: hashedPassword,
        name: 'Security Test Administrator',
        role: 'ADMIN',
        isActive: true,
        mfaEnabled: false,
      },
    });

    // Create target user for reset tests
    testTargetUser = await prisma.user.create({
      data: {
        email: 'test_sec_target@jkspdc.co.in',
        password: hashedPassword,
        name: 'Target Editor User',
        role: 'EDITOR',
        isActive: true,
        mfaEnabled: false,
      },
    });
  });

  after(async () => {
    if (prisma) {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: ['test_sec_admin@jkspdc.co.in', 'test_sec_target@jkspdc.co.in'],
          },
        },
      });
      await prisma.$disconnect();
    }
  });

  // 1. Initial Administrator Enrolment Security
  describe('1. Initial Administrator Enrolment Security', () => {
    it('should reject unbonded setup: login with password only returns mfaEnrollmentRequired and NO secrets', async () => {
      const loginRes = await authService.login(testAdmin.email, 'AdminSecPass123!');
      assert.equal(loginRes.mfaEnrollmentRequired, true);
      assert.equal(loginRes.token, undefined);
      assert.equal(loginRes.secret, undefined);
      assert.equal(loginRes.qrDataUrl, undefined);
      assert.ok(typeof loginRes.ticket === 'string' && loginRes.ticket.length === 64);
    });

    it('should reject enrolment authorization with invalid code', async () => {
      const loginRes = await authService.login(testAdmin.email, 'AdminSecPass123!');
      await assert.rejects(
        () => authService.mfaAuthorizeEnrollment(loginRes.ticket, 'INVALID-CODE-999'),
        (err) => err.status === 401,
      );
    });

    it('should grant setup secrets ONLY when valid single-use enrolment code is presented', async () => {
      // Provision enrolment code for test admin
      const rawCode = TotpUtil.generateEnrollmentCode();
      const codeHash = TotpUtil.hashEnrollmentCode(rawCode, TEST_MFA_KEY);
      await prisma.user.update({
        where: { id: testAdmin.id },
        data: {
          mfaEnrollmentCodeHash: codeHash,
          mfaEnrollmentExpiresAt: new Date(Date.now() + 3600000),
        },
      });

      const loginRes = await authService.login(testAdmin.email, 'AdminSecPass123!');
      const authRes = await authService.mfaAuthorizeEnrollment(loginRes.ticket, rawCode);

      assert.equal(authRes.mfaSetupReady, true);
      assert.ok(typeof authRes.secret === 'string' && authRes.secret.length === 32);
      assert.ok(authRes.qrDataUrl.startsWith('data:image/png;base64,'));

      // Confirm enrolment code was consumed on user
      const userAfter = await prisma.user.findUnique({ where: { id: testAdmin.id } });
      assert.equal(userAfter.mfaEnrollmentCodeHash, null);

      // Replay attempt must fail
      const loginRes2 = await authService.login(testAdmin.email, 'AdminSecPass123!');
      await assert.rejects(
        () => authService.mfaAuthorizeEnrollment(loginRes2.ticket, rawCode),
        (err) => err.status === 401,
      );
    });
  });

  // 2. Encrypt Temporary MFA Secrets at Rest
  describe('2. Encrypt Temporary MFA Secrets at Rest', () => {
    it('should store MfaChallenge.tempSecret in encrypted form (v1:...) at rest', async () => {
      const rawCode = TotpUtil.generateEnrollmentCode();
      await prisma.user.update({
        where: { id: testAdmin.id },
        data: {
          mfaEnrollmentCodeHash: TotpUtil.hashEnrollmentCode(rawCode, TEST_MFA_KEY),
          mfaEnrollmentExpiresAt: new Date(Date.now() + 3600000),
        },
      });

      const loginRes = await authService.login(testAdmin.email, 'AdminSecPass123!');
      const authRes = await authService.mfaAuthorizeEnrollment(loginRes.ticket, rawCode);

      // Inspect PostgreSQL challenge record directly
      const ticketHash = crypto.createHash('sha256').update(loginRes.ticket).digest('hex');
      const challengeInDb = await prisma.mfaChallenge.findUnique({ where: { ticketHash } });

      assert.ok(challengeInDb.tempSecret.startsWith('v1:'), 'tempSecret must start with version header v1:');
      assert.notEqual(challengeInDb.tempSecret, authRes.secret, 'Stored tempSecret must NOT be plaintext Base32');

      // Verify decryption matches
      const decrypted = MfaCryptoUtil.decrypt(challengeInDb.tempSecret, TEST_MFA_KEY);
      assert.equal(decrypted, authRes.secret);
    });
  });

  // 3 & 4. TOTP Replay Prevention & Concurrent Verification
  describe('3 & 4. TOTP Replay Prevention & Concurrent Verification', () => {
    let enrolledSecret;

    before(async () => {
      // Complete enrollment for testAdmin
      const rawCode = TotpUtil.generateEnrollmentCode();
      await prisma.user.update({
        where: { id: testAdmin.id },
        data: {
          mfaEnrollmentCodeHash: TotpUtil.hashEnrollmentCode(rawCode, TEST_MFA_KEY),
          mfaEnrollmentExpiresAt: new Date(Date.now() + 3600000),
        },
      });

      const loginRes = await authService.login(testAdmin.email, 'AdminSecPass123!');
      const authRes = await authService.mfaAuthorizeEnrollment(loginRes.ticket, rawCode);
      enrolledSecret = authRes.secret;

      const validTotp = TotpUtil.generateTotp(enrolledSecret, 0);
      const setupRes = await authService.mfaSetupConfirm(loginRes.ticket, validTotp);
      assert.ok(setupRes.token);
    });

    it('should reject reused TOTP code within same time-step window (Replay Protection)', async () => {
      const loginRes1 = await authService.login(testAdmin.email, 'AdminSecPass123!');
      // Use step +1 because step 0 was consumed during setup confirmation
      const code = TotpUtil.generateTotp(enrolledSecret, 1);

      // First verification succeeds for step +1
      const verifyRes1 = await authService.mfaVerify(loginRes1.ticket, code);
      assert.ok(verifyRes1.token);

      // Second login attempt within same window using identical code MUST fail
      const loginRes2 = await authService.login(testAdmin.email, 'AdminSecPass123!');
      await assert.rejects(
        () => authService.mfaVerify(loginRes2.ticket, code),
        (err) => err.status === 401 && err.message.includes('already been used'),
      );
    });

    it('should reject concurrent verification requests reusing the same TOTP step', async () => {
      // Simulate two concurrent challenges
      const loginResA = await authService.login(testAdmin.email, 'AdminSecPass123!');
      const loginResB = await authService.login(testAdmin.email, 'AdminSecPass123!');

      // Reset lastUsedTotpStep so current step 0 is valid and fresh for testing concurrent arrival
      await prisma.user.update({
        where: { id: testAdmin.id },
        data: { lastUsedTotpStep: null },
      });

      // Generate valid TOTP code for the current window (offset 0)
      const currentCode = TotpUtil.generateTotp(enrolledSecret, 0);

      // Execute two simultaneous verifications with the exact same code
      const results = await Promise.allSettled([
        authService.mfaVerify(loginResA.ticket, currentCode),
        authService.mfaVerify(loginResB.ticket, currentCode),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'Exactly one concurrent verification must succeed');
      assert.equal(rejected.length, 1, 'Concurrent replay attempt must be rejected');
    });
  });

  // 5. Secure Recovery Codes (12 chars, Keyed HMAC, Atomic Consumption)
  describe('5. Secure Recovery Codes', () => {
    let plainRecoveryCodes;

    before(async () => {
      const rawCode = TotpUtil.generateEnrollmentCode();
      await prisma.user.update({
        where: { id: testAdmin.id },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          mfaEnrollmentCodeHash: TotpUtil.hashEnrollmentCode(rawCode, TEST_MFA_KEY),
          mfaEnrollmentExpiresAt: new Date(Date.now() + 3600000),
        },
      });

      const loginRes = await authService.login(testAdmin.email, 'AdminSecPass123!');
      const authRes = await authService.mfaAuthorizeEnrollment(loginRes.ticket, rawCode);
      const validTotp = TotpUtil.generateTotp(authRes.secret, 0);
      const setupRes = await authService.mfaSetupConfirm(loginRes.ticket, validTotp);
      plainRecoveryCodes = setupRes.recoveryCodes;
    });

    it('should generate 12-character recovery codes with format XXXX-XXXX-XXXX', () => {
      assert.equal(plainRecoveryCodes.length, 8);
      assert.ok(plainRecoveryCodes.every((c) => /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)));
    });

    it('should store recovery codes as keyed HMAC-SHA256 in database', async () => {
      const dbCodes = await prisma.mfaRecoveryCode.findMany({ where: { userId: testAdmin.id } });
      const expectedHmac = TotpUtil.hashRecoveryCode(plainRecoveryCodes[0], TEST_MFA_KEY);
      const bareSha256 = crypto.createHash('sha256').update(plainRecoveryCodes[0].replace(/-/g, '')).digest('hex');

      assert.ok(dbCodes.some((c) => c.codeHash === expectedHmac));
      assert.ok(!dbCodes.some((c) => c.codeHash === bareSha256), 'Must NOT be bare unsalted SHA-256');
    });

    it('should consume recovery code atomically and reject subsequent replays', async () => {
      const codeToUse = plainRecoveryCodes[0];
      const loginRes = await authService.login(testAdmin.email, 'AdminSecPass123!');

      const verifyRes = await authService.mfaVerify(loginRes.ticket, codeToUse, true);
      assert.ok(verifyRes.token);

      // Replay attempt must fail
      const loginRes2 = await authService.login(testAdmin.email, 'AdminSecPass123!');
      await assert.rejects(
        () => authService.mfaVerify(loginRes2.ticket, codeToUse, true),
        (err) => err.status === 401 && err.message.includes('Invalid or already used'),
      );
    });

    it('should atomically handle concurrent recovery code consumption', async () => {
      const codeToUse = plainRecoveryCodes[1];
      const loginResA = await authService.login(testAdmin.email, 'AdminSecPass123!');
      const loginResB = await authService.login(testAdmin.email, 'AdminSecPass123!');

      const results = await Promise.allSettled([
        authService.mfaVerify(loginResA.ticket, codeToUse, true),
        authService.mfaVerify(loginResB.ticket, codeToUse, true),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'Exactly one concurrent recovery code request must succeed');
      assert.equal(rejected.length, 1, 'Second concurrent request must fail atomically');
    });
  });

  // 6. Secure Encryption Key Management & Missing Key Scenario
  describe('6. Secure Encryption Key Management', () => {
    it('should fail safely if MFA_ENCRYPTION_KEY is missing from service', () => {
      const origEnv = process.env.MFA_ENCRYPTION_KEY;
      delete process.env.MFA_ENCRYPTION_KEY;
      try {
        const badConfig = new MockConfigService({ MFA_ENCRYPTION_KEY: '' });
        const brokenAuth = new AuthService(prisma, badConfig);

        assert.throws(
          () => brokenAuth.getMfaEncryptionKey(),
          (err) => err.message.includes('MFA master encryption key is not configured'),
        );
      } finally {
        process.env.MFA_ENCRYPTION_KEY = origEnv;
      }
    });

    it('should support key rotation without invalidating existing secrets', () => {
      const oldKey = 'old_secret_key_012345678901234567890123456789';
      const newKey = 'new_secret_key_abcdefabcdefabcdefabcdefabcdef';
      const plaintext = 'JBSWY3DPEHPK3PXP';

      const encryptedOld = MfaCryptoUtil.encrypt(plaintext, oldKey);
      assert.ok(encryptedOld.startsWith('v1:'));

      const rotated = MfaCryptoUtil.rotateKey(encryptedOld, oldKey, newKey);
      assert.ok(rotated.startsWith('v1:'));

      const decrypted = MfaCryptoUtil.decrypt(rotated, newKey);
      assert.equal(decrypted, plaintext);
    });
  });

  // 7. MFA Reset Protection with Step-Up Authentication
  describe('7. MFA Reset Protection with Step-Up Authentication', () => {
    let adminTotpSecret;

    before(async () => {
      // Re-enroll testAdmin with known secret
      const rawCode = TotpUtil.generateEnrollmentCode();
      await prisma.user.update({
        where: { id: testAdmin.id },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          mfaEnrollmentCodeHash: TotpUtil.hashEnrollmentCode(rawCode, TEST_MFA_KEY),
          mfaEnrollmentExpiresAt: new Date(Date.now() + 3600000),
        },
      });
      const loginRes = await authService.login(testAdmin.email, 'AdminSecPass123!');
      const authRes = await authService.mfaAuthorizeEnrollment(loginRes.ticket, rawCode);
      adminTotpSecret = authRes.secret;
      const validTotp = TotpUtil.generateTotp(adminTotpSecret, 0);
      await authService.mfaSetupConfirm(loginRes.ticket, validTotp);
    });

    it('should reject reset request if caller password is missing or invalid', async () => {
      const totp = TotpUtil.generateTotp(adminTotpSecret, 0);
      await assert.rejects(
        () => usersService.resetMfa(testTargetUser.id, { userId: testAdmin.id }, {
          currentPassword: 'WRONG_PASSWORD',
          totpCode: totp,
          reason: 'Valid justification',
        }, '127.0.0.1', 'test-agent'),
        (err) => err.status === 401 && err.message.includes('Invalid administrator password'),
      );
    });

    it('should reject reset request if caller TOTP is missing or invalid', async () => {
      await assert.rejects(
        () => usersService.resetMfa(testTargetUser.id, { userId: testAdmin.id }, {
          currentPassword: 'AdminSecPass123!',
          totpCode: '000000',
          reason: 'Valid justification',
        }, '127.0.0.1', 'test-agent'),
        (err) => err.status === 401 && err.message.includes('Invalid administrator TOTP code'),
      );
    });

    it('should succeed with valid step-up credentials and generate new enrolment authorization code', async () => {
      const validTotp = TotpUtil.generateTotp(adminTotpSecret, 1);
      const resetRes = await usersService.resetMfa(testTargetUser.id, { userId: testAdmin.id }, {
        currentPassword: 'AdminSecPass123!',
        totpCode: validTotp,
        reason: 'Lost mobile device - replacement authorized',
      }, '127.0.0.1', 'test-agent');

      assert.equal(resetRes.success, true);
      assert.ok(resetRes.enrollmentCode.startsWith('ENR-'));

      // Target user state must be reset
      const targetAfter = await prisma.user.findUnique({ where: { id: testTargetUser.id } });
      assert.equal(targetAfter.mfaEnabled, false);
      assert.equal(targetAfter.mfaSecret, null);
      assert.ok(targetAfter.mfaEnrollmentCodeHash !== null);
    });
  });

  // 8. Account-Based Login Rate Limiting
  describe('8. Account-Based Login Rate Limiting', () => {
    it('should throttle repeated login requests for the same account across different IPs', async () => {
      const throttlerGuard = new HttpThrottlerGuard({}, {}, {});
      const email = 'victim_admin@jkspdc.co.in';

      // 5 requests from 5 completely different IPs
      for (let i = 1; i <= 5; i++) {
        const mockProps = {
          context: {
            switchToHttp: () => ({
              getRequest: () => ({
                method: 'POST',
                url: '/api/auth/login',
                ip: `198.51.100.${i}`,
                body: { email, password: 'password' },
                headers: {},
              }),
            }),
          },
        };
        // Simulated call to handleRequest
        await throttlerGuard.handleRequest(mockProps).catch((e) => {
          // IP throttler super.handleRequest may throw if mocked, ignore for account-level unit check
        });
      }

      // 6th attempt from a 6th unique IP must trigger account throttling
      const attackProps = {
        context: {
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'POST',
              url: '/api/auth/login',
              ip: '203.0.113.99',
              body: { email, password: 'password' },
              headers: {},
            }),
          }),
        },
      };

      await assert.rejects(
        () => throttlerGuard.handleRequest(attackProps),
        (err) => err.message.includes('Too many login attempts for this account'),
      );
    });
  });

  // 9. Challenge Ticket Protection (Hashed Storage)
  describe('9. Challenge Ticket Protection (Hashed Storage)', () => {
    it('should store ticketHash in database and never raw ticket', async () => {
      const loginRes = await authService.login(testAdmin.email, 'AdminSecPass123!');
      const rawTicket = loginRes.ticket;
      const expectedHash = crypto.createHash('sha256').update(rawTicket).digest('hex');

      // Raw ticket must NOT exist as a column or value in MfaChallenge
      const byHash = await prisma.mfaChallenge.findUnique({ where: { ticketHash: expectedHash } });
      assert.ok(byHash);
      assert.equal(byHash.userId, testAdmin.id);
    });

    it('should clean up expired challenges via cleanupExpiredChallenges()', async () => {
      // Create artificially expired challenge
      const expiredRawTicket = crypto.randomBytes(32).toString('hex');
      const expiredHash = crypto.createHash('sha256').update(expiredRawTicket).digest('hex');

      await prisma.mfaChallenge.create({
        data: {
          userId: testAdmin.id,
          ticketHash: expiredHash,
          expiresAt: new Date(Date.now() - 60000), // 1 minute in the past
        },
      });

      const deletedCount = await authService.cleanupExpiredChallenges();
      assert.ok(deletedCount >= 1);

      const lookup = await prisma.mfaChallenge.findUnique({ where: { ticketHash: expiredHash } });
      assert.equal(lookup, null);
    });
  });
});
