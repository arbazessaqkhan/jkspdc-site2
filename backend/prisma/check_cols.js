const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRawUnsafe('PRAGMA table_info(Download);')
  .then(cols => console.log('Download columns:', cols))
  .catch(console.error)
  .finally(() => p.$disconnect());
