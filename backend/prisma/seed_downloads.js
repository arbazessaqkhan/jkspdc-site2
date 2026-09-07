const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialDownloads = [
  {
    title: 'NIT Upload Request Form',
    category: 'Downloads',
    description: 'Official form and instructions required for submitting NIT, e-NIT Gist, Quotations, or Corrigenda for upload to the web portal via webupdates[at]jkspdcl[dot]com.',
    fileName: 'NIT Upload Request Form.pdf',
    documentUrl: '/NIT Upload Request Form.pdf',
    status: 'Active'
  },
  {
    title: 'User Creation',
    category: 'Downloads',
    description: 'Requisite details form and instructions for generating user credentials and mapping digital signature certificates on jktenders.gov.in website.',
    fileName: 'User Creation.pdf',
    documentUrl: '/User Creation.pdf',
    status: 'Active'
  },
  {
    title: 'Whistle Blower Policy',
    category: 'Policies',
    description: 'Framework establishing a transparent vigilance mechanism for safeguarding the corporation against malpractices, abuse of authority, and corporate threats.',
    fileName: 'Whistle Blower Policy.pdf',
    documentUrl: '/Whistle Blower Policy.pdf',
    status: 'Active'
  }
];

async function main() {
  for (const item of initialDownloads) {
    const existing = await prisma.download.findFirst({
      where: { title: item.title }
    });
    if (!existing) {
      const created = await prisma.download.create({
        data: item
      });
      console.log('Created download:', created.title, created.category);
    } else {
      console.log('Already exists:', existing.title);
    }
  }
  const all = await prisma.download.findMany();
  console.log('Total downloads in DB:', all.length);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
