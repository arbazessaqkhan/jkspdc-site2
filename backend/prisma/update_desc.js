const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const id = process.argv[2];
const description = process.argv[3];

if (id && description) {
  prisma.$executeRawUnsafe('UPDATE Download SET description = ? WHERE id = ?', description, id)
    .then(() => console.log('Updated description for', id))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
} else {
  prisma.$disconnect();
}
