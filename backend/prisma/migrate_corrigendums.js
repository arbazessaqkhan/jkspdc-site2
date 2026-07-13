const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration for corrigendums...');

  // 1. Fetch all separate corrigendums
  const corrigendums = await prisma.tender.findMany({
    where: { documentType: 'CORRIGENDUM' }
  });

  console.log(`Found ${corrigendums.length} separate corrigendum records.`);

  for (const corr of corrigendums) {
    if (!corr.parentTenderId) {
      console.warn(`Corrigendum ${corr.referenceNo} (ID: ${corr.id}) has no parentTenderId. Skipping.`);
      continue;
    }

    const parent = await prisma.tender.findUnique({
      where: { id: corr.parentTenderId }
    });

    if (!parent) {
      console.warn(`Parent tender with ID ${corr.parentTenderId} not found for corrigendum ${corr.referenceNo}. Skipping.`);
      continue;
    }

    // Initialize or parse existing parent corrigendums
    let parentCorrs = [];
    if (parent.corrigendums) {
      if (Array.isArray(parent.corrigendums)) {
        parentCorrs = [...parent.corrigendums];
      } else {
        try {
          parentCorrs = JSON.parse(parent.corrigendums);
        } catch (e) {
          console.error(`Failed to parse corrigendums for parent ${parent.id}:`, e);
          parentCorrs = [];
        }
      }
    }

    // Map properties
    const newCorrObj = {
      id: corr.id,
      title: corr.title,
      publishDate: corr.publishDate,
      documentUrl: corr.documentUrl,
      fileSizeBytes: corr.fileSizeBytes,
      extendedClosingDate: corr.closingDate,
      extendedBidOpeningDate: corr.bidOpeningDate
    };

    parentCorrs.push(newCorrObj);

    // Update parent tender
    await prisma.tender.update({
      where: { id: parent.id },
      data: {
        corrigendums: parentCorrs
      }
    });

    console.log(`Successfully migrated ${corr.referenceNo} into parent ${parent.referenceNo}`);
  }

  // 2. Delete separate corrigendums
  if (corrigendums.length > 0) {
    const deleteResult = await prisma.tender.deleteMany({
      where: { documentType: 'CORRIGENDUM' }
    });
    console.log(`Deleted ${deleteResult.count} separate corrigendum records from Tender table.`);
  }

  console.log('Data migration completed successfully!');
}

main()
  .catch(e => {
    console.error('Error during data migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
