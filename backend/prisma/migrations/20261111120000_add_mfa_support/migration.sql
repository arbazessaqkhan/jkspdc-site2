-- AlterTable
ALTER TABLE "User" ADD COLUMN "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "mfaSecret" TEXT;
ALTER TABLE "User" ADD COLUMN "mfaEnrolledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MfaRecoveryCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MfaRecoveryCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MfaChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,
    "tempSecret" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MfaChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MfaRecoveryCode_userId_idx" ON "MfaRecoveryCode"("userId");
CREATE INDEX "MfaRecoveryCode_codeHash_idx" ON "MfaRecoveryCode"("codeHash");

-- CreateIndex
CREATE UNIQUE INDEX "MfaChallenge_ticket_key" ON "MfaChallenge"("ticket");
CREATE INDEX "MfaChallenge_userId_idx" ON "MfaChallenge"("userId");
CREATE INDEX "MfaChallenge_ticket_idx" ON "MfaChallenge"("ticket");
CREATE INDEX "MfaChallenge_expiresAt_idx" ON "MfaChallenge"("expiresAt");

-- AddForeignKey
ALTER TABLE "MfaRecoveryCode" ADD CONSTRAINT "MfaRecoveryCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfaChallenge" ADD CONSTRAINT "MfaChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

