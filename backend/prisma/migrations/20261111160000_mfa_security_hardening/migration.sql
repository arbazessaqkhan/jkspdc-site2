-- AlterTable User
ALTER TABLE "User" ADD COLUMN "lastUsedTotpStep" BIGINT;
ALTER TABLE "User" ADD COLUMN "mfaEnrollmentCodeHash" TEXT;
ALTER TABLE "User" ADD COLUMN "mfaEnrollmentExpiresAt" TIMESTAMP(3);

-- AlterTable MfaChallenge
-- Rename ticket to ticketHash to store cryptographic hash of tickets
ALTER TABLE "MfaChallenge" RENAME COLUMN "ticket" TO "ticketHash";
ALTER INDEX IF EXISTS "MfaChallenge_ticket_key" RENAME TO "MfaChallenge_ticketHash_key";
ALTER INDEX IF EXISTS "MfaChallenge_ticket_idx" RENAME TO "MfaChallenge_ticketHash_idx";
ALTER TABLE "MfaChallenge" ADD COLUMN "isEnrollmentReady" BOOLEAN NOT NULL DEFAULT false;

