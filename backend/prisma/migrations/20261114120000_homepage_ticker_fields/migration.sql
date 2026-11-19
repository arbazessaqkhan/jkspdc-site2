-- AlterTable Tender
ALTER TABLE "Tender" ADD COLUMN "fileFormat" TEXT;
ALTER TABLE "Tender" ADD COLUMN "showInTicker" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tender" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'Normal';

-- Corrigenda are ticker-visible by default
UPDATE "Tender" SET "showInTicker" = true WHERE "documentType" = 'CORRIGENDUM';

-- AlterTable Notification
ALTER TABLE "Notification" ADD COLUMN "fileSizeBytes" INTEGER;
ALTER TABLE "Notification" ADD COLUMN "fileFormat" TEXT;
ALTER TABLE "Notification" ADD COLUMN "validTillDate" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN "showInTicker" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Notification" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'Normal';
