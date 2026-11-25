#!/usr/bin/env node
/**
 * JKSPDC Server-Side CLI for Provisioning & Resetting System Administrator (ADMIN) Accounts
 *
 * PSU Security Policy:
 *   ADMIN accounts cannot be created or escalated via the public/web Admin API.
 *   They must be provisioned out-of-band directly on the server/database using this script.
 *
 * Usage:
 *   Create / Update ADMIN & issue 72h Enrolment Code:
 *     npm run admin:provision -- --email "officer@jkspdc.co.in" --name "Sh. Officer Name" --password "TempPassword@2026"
 *
 *   Re-issue a fresh 72h Enrolment Code (Reset MFA) for an existing ADMIN:
 *     npm run admin:provision -- --reset-mfa --email "officer@jkspdc.co.in"
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

// Load backend/.env if environment variables are not already provided (e.g., local dev vs Render Shell)
function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvFile();

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 5,
  maxmem: 64 * 1024 * 1024,
  keyLen: 32,
  saltLen: 16,
};

const RECOVERY_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

function hashPassword(password) {
  const salt = crypto.randomBytes(SCRYPT_PARAMS.saltLen);
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keyLen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
    maxmem: SCRYPT_PARAMS.maxmem,
  });
  return `$scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${salt.toString('base64')}$${derivedKey.toString('base64')}`;
}

function generateEnrollmentCode() {
  const bytes = crypto.randomBytes(12);
  let p1 = '';
  let p2 = '';
  let p3 = '';
  for (let j = 0; j < 4; j++) {
    p1 += RECOVERY_CHARSET[bytes[j] % RECOVERY_CHARSET.length];
    p2 += RECOVERY_CHARSET[bytes[j + 4] % RECOVERY_CHARSET.length];
    p3 += RECOVERY_CHARSET[bytes[j + 8] % RECOVERY_CHARSET.length];
  }
  return `ENR-${p1}-${p2}-${p3}`;
}

function hashEnrollmentCode(code, hmacKey) {
  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return crypto.createHmac('sha256', hmacKey).update(normalized).digest('hex');
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--reset-mfa') {
      args.resetMfa = true;
    } else if (token.startsWith('--')) {
      const key = token.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : '';
      args[key] = val;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = (args.email || '').trim().toLowerCase();
  const name = (args.name || '').trim();
  const password = args.password || '';
  const resetMfaOnly = !!args.resetMfa;

  const mfaKey = (process.env.MFA_ENCRYPTION_KEY || '').trim();
  if (!mfaKey) {
    console.error('ERROR: MFA_ENCRYPTION_KEY is not set in the environment.');
    process.exit(1);
  }

  if (!email) {
    console.error('Usage:');
    console.error('  Create ADMIN:    npm run admin:provision -- --email "admin@jkspdc.co.in" --name "Full Name" --password "TempPassword!"');
    console.error('  Reset ADMIN MFA: npm run admin:provision -- --reset-mfa --email "admin@jkspdc.co.in"');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const enrollmentCode = generateEnrollmentCode();
    const enrollmentCodeHash = hashEnrollmentCode(enrollmentCode, mfaKey);
    const enrollmentExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    if (resetMfaOnly) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        console.error(`ERROR: User with email "${email}" not found.`);
        process.exit(1);
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: existing.id },
          data: {
            mfaEnabled: false,
            mfaSecret: null,
            mfaEnrolledAt: null,
            lastUsedTotpStep: null,
            mfaEnrollmentCodeHash: enrollmentCodeHash,
            mfaEnrollmentExpiresAt: enrollmentExpiresAt,
          },
        });
        await tx.mfaRecoveryCode.deleteMany({ where: { userId: existing.id } });
        await tx.mfaChallenge.deleteMany({ where: { userId: existing.id } });
        await tx.session.updateMany({
          where: { userId: existing.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      });

      await prisma.auditLog.create({
        data: {
          userId: existing.id,
          action: 'ADMIN_MFA_RESET_CLI',
          ipAddress: 'localhost-cli',
          userAgent: 'provision-admin.js',
          details: JSON.stringify({ email: existing.email, role: existing.role }),
        },
      }).catch(() => {});

      console.log('\n=== JKSPDC ADMIN MFA RESET (CLI) ===');
      console.log(`Account:            ${existing.name} <${existing.email}>`);
      console.log(`Role:               ${existing.role}`);
      console.log(`Enrolment Code:     ${enrollmentCode}`);
      console.log(`Valid Until (UTC):  ${enrollmentExpiresAt.toISOString()}`);
      console.log('Share this single-use code out-of-band. It will be required on next /admin/login.\n');
      return;
    }

    if (!name || !password || password.length < 8) {
      console.error('ERROR: --name and --password (min 8 chars) are required when provisioning a new ADMIN.');
      process.exit(1);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.error(`ERROR: User "${email}" already exists (role: ${existing.role}). Use --reset-mfa to re-issue an enrolment code.`);
      process.exit(1);
    }

    const passwordHash = hashPassword(password);
    const created = await prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
        role: 'ADMIN',
        isActive: true,
        mfaEnabled: false,
        mfaEnrollmentCodeHash: enrollmentCodeHash,
        mfaEnrollmentExpiresAt: enrollmentExpiresAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: created.id,
        action: 'ADMIN_PROVISIONED_CLI',
        ipAddress: 'localhost-cli',
        userAgent: 'provision-admin.js',
        details: JSON.stringify({ email: created.email, name: created.name, role: 'ADMIN' }),
      },
    }).catch(() => {});

    console.log('\n=== JKSPDC SYSTEM ADMIN PROVISIONED (CLI) ===');
    console.log(`ID:                 ${created.id}`);
    console.log(`Name:               ${created.name}`);
    console.log(`Email:              ${created.email}`);
    console.log(`Role:               ${created.role}`);
    console.log(`Enrolment Code:     ${enrollmentCode}`);
    console.log(`Valid Until (UTC):  ${enrollmentExpiresAt.toISOString()}`);
    console.log('Instructions: Share the email, temporary password, and single-use Enrolment Code');
    console.log('out-of-band. On first sign-in at /admin/login, the user will authorize this code,');
    console.log('scan the Authenticator QR code, and receive 8 backup recovery codes.\n');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Fatal error provisioning admin:', err);
  process.exit(1);
});
