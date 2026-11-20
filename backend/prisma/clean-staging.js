const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanStaging() {
  console.log('Cleaning mock/seeded fallback data from database...');

  // 1. Delete seed tenders
  const deletedTenders = await prisma.tender.deleteMany({
    where: {
      OR: [
        { id: { startsWith: 'tender-seed-' } },
        { referenceNo: { in: ['JKSPDCL/eNIT/2026/CIVIL/01', 'JKSPDCL/eNIT/2026/EM/04', 'JKSPDCL/eNIT/2026/IT/09'] } }
      ]
    }
  });
  console.log(`Deleted ${deletedTenders.count} seed tenders.`);

  // 2. Delete seed gallery items
  const deletedGallery = await prisma.galleryItem.deleteMany({
    where: {
      id: { startsWith: 'gallery-seed-' }
    }
  });
  console.log(`Deleted ${deletedGallery.count} seed gallery items.`);

  // 3. Delete seed hero slides
  const deletedSlides = await prisma.heroSlide.deleteMany({
    where: {
      id: { startsWith: 'slide-seed-' }
    }
  });
  console.log(`Deleted ${deletedSlides.count} seed hero slides.`);

  // 4. Delete seed power stations
  const deletedStations = await prisma.powerStation.deleteMany({
    where: {
      OR: [
        { id: { startsWith: 'station-seed-' } },
        { name: 'Kirthai HEP Stage-1' }
      ]
    }
  });
  console.log(`Deleted ${deletedStations.count} seed power stations.`);

  // 5. Delete seed notifications if any
  try {
    const deletedNotifs = await prisma.notification.deleteMany({
      where: {
        id: { startsWith: 'notif-seed-' }
      }
    });
    console.log(`Deleted ${deletedNotifs.count} seed notifications.`);
  } catch (err) {
    // Notification table might use different field or not have seed ids
  }

  console.log('Database cleanup completed! Only official and administrator-uploaded content remains.');
}

cleanStaging()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
