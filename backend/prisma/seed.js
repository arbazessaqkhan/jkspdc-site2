const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin User
  const adminEmail = 'admin@jkspdc.co.in';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminPasswordHash = hashPassword('admin123');
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Administrator',
        password: adminPasswordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('Admin user created: admin@jkspdc.co.in / admin123');
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Create Board of Directors (BOD)
  const directors = [
    {
      name: 'Sh. Satish Chandra, IAS',
      position: 'Chairman',
      role: 'Non-Executive Director',
      sNo: 1,
    },
    {
      name: 'Sh. Vikrant Gupta',
      position: 'Managing Director',
      role: 'Executive Director',
      sNo: 2,
    },
    {
      name: 'Smt. Anjali Dev',
      position: 'Director Finance',
      role: 'Executive Director',
      sNo: 3,
    },
  ];

  for (const dir of directors) {
    await prisma.director.upsert({
      where: { id: `dir-seed-${dir.sNo}` },
      create: {
        id: `dir-seed-${dir.sNo}`,
        name: dir.name,
        position: dir.position,
        role: dir.role,
        sNo: dir.sNo,
      },
      update: {
        name: dir.name,
        position: dir.position,
        role: dir.role,
        sNo: dir.sNo,
      },
    });
  }
  console.log('Board of Directors seeded.');

  // 3. Create Power Stations (Operational & Under Construction)
  const stations = [
    {
      id: 'station-seed-1',
      name: 'Baghliar Hydroelectric Project',
      type: 'Run-of-River',
      capacityMw: 900.0,
      status: 'Operational',
      location: 'Ramban',
      configuration: '3x150MW (Stage I) & 3x150MW (Stage II)',
      designEnergy: 2600.0,
      yearOfCommissioning: 2008,
      sector: 'State',
      basin: 'Chenab',
      salientFeatures: '<p>Baglihar Hydroelectric Project is built on the Chenab River in the Ramban district. It is a run-of-the-river power project with an installed capacity of 900 MW.</p>',
      description: 'One of the flagship operational projects of JKSPDCL.',
    },
    {
      id: 'station-seed-2',
      name: 'Lower Jhelum Hydel Project',
      type: 'Run-of-River',
      capacityMw: 105.0,
      status: 'Operational',
      location: 'Baramulla',
      configuration: '3x35MW',
      designEnergy: 450.0,
      yearOfCommissioning: 1979,
      sector: 'State',
      basin: 'Jhelum',
      salientFeatures: '<p>Located near Gantamulla in Baramulla district. Uses water from Jhelum river.</p>',
      description: 'An older but vital source of energy in the Jhelum basin.',
    },
    {
      id: 'station-seed-3',
      name: 'Sawalkote Hydroelectric Project',
      type: 'Run-of-River',
      capacityMw: 1856.0,
      status: 'Under Construction',
      location: 'Ramban',
      commissionedDate: new Date('2028-12-31'),
      description: 'A major upcoming run-of-the-river project on the Chenab River.',
    },
    {
      id: 'station-seed-4',
      name: 'Kirthai-II Hydroelectric Project',
      type: 'Run-of-River',
      capacityMw: 990.0,
      status: 'Under Construction',
      location: 'Kishtwar',
      commissionedDate: new Date('2030-06-30'),
      description: 'A run-of-river project planned on the Chenab river.',
    },
  ];

  for (const st of stations) {
    await prisma.powerStation.upsert({
      where: { name: st.name },
      create: st,
      update: st,
    });
  }
  console.log('Power stations seeded.');

  // 4. Create Gallery Items
  const galleryItems = [
    {
      id: 'gallery-seed-1',
      title: 'Signing of Implementation Agreement NHPC & JKSPDC',
      imageUrl: '/gallery/signing_agreement.png',
      partition: 'Official Events',
    },
    {
      id: 'gallery-seed-2',
      title: 'Retirement Ceremony of Executive Director Civil, JKSPDC',
      imageUrl: '/gallery/retirement_ed_civil.png',
      partition: 'Corporate',
    },
    {
      id: 'gallery-seed-3',
      title: 'Hydroelectric Project Site View',
      imageUrl: '/gallery/projects_gallery.jpg',
      partition: 'Projects',
    },
    {
      id: 'gallery-seed-4',
      title: 'Baglihar Hydroelectric Dam Construction',
      imageUrl: '/slider1.jpg',
      partition: 'Projects',
    },
    {
      id: 'gallery-seed-5',
      title: 'Corporate HQ and Administrative Building',
      imageUrl: '/slider2.jpg',
      partition: 'Corporate',
    },
    {
      id: 'gallery-seed-6',
      title: 'Official Executive Board Meeting',
      imageUrl: '/slider3.jpg',
      partition: 'Official Events',
    },
  ];

  for (const item of galleryItems) {
    await prisma.galleryItem.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }
  console.log('Gallery items seeded.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
