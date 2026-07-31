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
      id: 'dir-manoj-sinha',
      name: 'Shri Manoj Sinha',
      position: 'Lieutenant Governor, UT of Jammu and Kashmir',
      role: 'Honorable Lieutenant Governor',
      sNo: 1,
    },
    {
      id: 'dir-omar-abdullah',
      name: 'Shri Omar Abdullah',
      position: 'Chief Minister, UT of Jammu and Kashmir (Minister Incharge Power Development Department)',
      role: 'Honorable Chief Minister',
      sNo: 2,
    },
    {
      id: 'dir-ashwani-kumar',
      name: 'Shri Ashwani Kumar (IAS)',
      position: 'Financial Commissioner (Additional Chief Secretary, Power Development Department)',
      role: 'Chairman',
      sNo: 3,
    },
    {
      id: 'dir-rahul-yadav',
      name: 'Shri Rahul Yadav (IAS)',
      position: 'Managing Director, JKSPDC',
      role: 'Managing Director',
      sNo: 4,
    }
  ];

  for (const dir of directors) {
    await prisma.director.upsert({
      where: { id: dir.id },
      create: {
        id: dir.id,
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
      id: 'station-seed-upcoming-1',
      name: 'Kirthai HEP Stage-1',
      type: 'Hydro',
      capacityMw: 390.0,
      status: 'Upcoming',
      location: 'Kishtwar',
      description: 'Kirthai HEP Stage-1 is a run-of-river scheme on river Chenab located at Gulabgarh, Padder in district Kishtwar of J & K and is about 66km from Kishtwar town.',
      sector: 'State',
      basin: 'Chenab',
      salientFeatures: `<p class="mb-4">Kirthai HEP Stage-1 is a run-of-river scheme on river Chenab located at Gulabgarh, Padder in district Kishtwar of J & K and is about 66km from Kishtwar town.</p>
<p class="mb-4"><strong>Salient features:</strong></p>
<ul class="list-disc list-inside space-y-2 mb-4">
  <li><strong>Installed capacity:</strong> 390 MW</li>
  <li><strong>Height of Dam:</strong> 119.50m (above river bed level)</li>
  <li><strong>Length of dam at top:</strong> 252.45 m</li>
  <li><strong>Reservoir stretch:</strong> 9.50 km</li>
  <li><strong>Power House:</strong> Underground (133.5 x 20.0 x 43.5) m</li>
  <li><strong>Gross Head:</strong> 108.5 m</li>
</ul>
<p class="mb-4">The DPR of the above project was under appraisal at Central Electricity Authority (CEA) / Central Water Commission (CWC) for obtaining Techno-Economic Clearance.</p>`,
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
  // 5. Create Sample Active Tenders
  const tenders = [
    {
      id: 'tender-seed-1',
      referenceNo: 'JKSPDCL/eNIT/2026/CIVIL/01',
      title: 'Construction & Slope Stabilization Works for Kirthai HEP Stage-1 Access Road',
      description: 'Comprehensive civil execution for access road network and tunnel portal slope protection at Gulabgarh, Padder.',
      documentType: 'NIT',
      workCategory: 'Civil',
      locationTag: 'HQ_SRINAGAR',
      publishDate: new Date('2026-07-15'),
      closingDate: new Date('2026-08-30'),
      documentUrl: '/uploads/tenders/nit_kirthai_civil_01.pdf',
      fileSizeBytes: 2450000,
      status: 'Active',
    },
    {
      id: 'tender-seed-2',
      referenceNo: 'JKSPDCL/eNIT/2026/EM/04',
      title: 'Supply and Installation of 132kV Switchyard Equipment at USHP II Kangan',
      description: 'Electro-mechanical retrofitting and circuit breaker replacement for Upper Sindh Hydel Project Stage II.',
      documentType: 'NIT',
      workCategory: 'Electro-Mechanical',
      locationTag: 'HEP_LOWER_JHELUM',
      publishDate: new Date('2026-07-20'),
      closingDate: new Date('2026-09-15'),
      documentUrl: '/uploads/tenders/nit_ushp_em_04.pdf',
      fileSizeBytes: 1850000,
      status: 'Active',
    },
    {
      id: 'tender-seed-3',
      referenceNo: 'JKSPDCL/eNIT/2026/IT/09',
      title: 'Development of SCADA Integration & Real-time Telemetry Data Portal',
      description: 'IT and telemetry integration across operational hydroelectric power houses in J&K.',
      documentType: 'NIT',
      workCategory: 'IT',
      locationTag: 'HQ_JAMMU',
      publishDate: new Date('2026-07-25'),
      closingDate: new Date('2026-09-01'),
      documentUrl: '/uploads/tenders/nit_it_scada_09.pdf',
      fileSizeBytes: 1200000,
      status: 'Active',
    }
  ];

  for (const t of tenders) {
    await prisma.tender.upsert({
      where: { referenceNo: t.referenceNo },
      create: t,
      update: t,
    });
  }
  console.log('Sample tenders seeded.');

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
