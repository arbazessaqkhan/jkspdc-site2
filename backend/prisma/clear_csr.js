const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearCSR() {
  const result = await prisma.policyDocument.deleteMany({
    where: { category: 'CSR' }
  });
  console.log(`Deleted ${result.count} CSR documents.`);
}

clearCSR()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
