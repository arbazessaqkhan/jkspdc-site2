const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCSR() {
  const docs = await prisma.policyDocument.findMany();
  for (const doc of docs) {
    if (doc.title.toUpperCase().includes('CSR') || (doc.description && doc.description.toUpperCase().includes('CSR'))) {
      await prisma.policyDocument.update({
        where: { id: doc.id },
        data: { category: 'CSR' }
      });
      console.log(`Updated document "${doc.title}" category to CSR.`);
    }
  }
}

updateCSR()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
