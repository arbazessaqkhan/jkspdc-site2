-- DropForeignKey
ALTER TABLE "HydroChunk" DROP CONSTRAINT IF EXISTS "HydroChunk_documentId_fkey";

-- DropTable
DROP TABLE IF EXISTS "HydroDocument";

-- DropTable
DROP TABLE IF EXISTS "HydroChunk";

-- DropTable
DROP TABLE IF EXISTS "HydroAdminOverride";

-- DropTable
DROP TABLE IF EXISTS "HydroConversation";

-- DropTable
DROP TABLE IF EXISTS "HydroIngestionLog";

