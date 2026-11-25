-- Ensure GalleryItem has all columns required by schema.prisma (for DBs initialized from baseline_postgres)
ALTER TABLE "public"."GalleryItem"
    ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS "projectId" TEXT,
    ADD COLUMN IF NOT EXISTS "projectName" TEXT,
    ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "public"."GalleryItem"
    ALTER COLUMN "partition" DROP NOT NULL,
    ALTER COLUMN "partition" SET DEFAULT 'General';

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."GalleryImage" (
    "id" TEXT NOT NULL,
    "galleryItemId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GalleryImage_galleryItemId_idx" ON "public"."GalleryImage"("galleryItemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GalleryImage_displayOrder_idx" ON "public"."GalleryImage"("displayOrder");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'GalleryImage_galleryItemId_fkey'
    ) THEN
        ALTER TABLE "public"."GalleryImage" ADD CONSTRAINT "GalleryImage_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "public"."GalleryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
