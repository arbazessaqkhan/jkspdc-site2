const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 5,
  maxmem: 64 * 1024 * 1024,
  keyLen: 32,
  saltLen: 16,
};


function hashPassword(password) {
  const salt = crypto.randomBytes(SCRYPT_PARAMS.saltLen);
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keyLen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
    maxmem: SCRYPT_PARAMS.maxmem,
  });
  const saltB64 = salt.toString('base64');
  const hashB64 = derivedKey.toString('base64');
  return `$scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${saltB64}$${hashB64}`;
}

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin User
  const adminEmail = 'admin@jkspdc.co.in';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const isProduction = process.env.NODE_ENV === 'production';
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (isProduction && !initialPassword) {
      throw new Error(
        'SECURITY ERROR: Cannot seed default admin account in production without INITIAL_ADMIN_PASSWORD environment variable.'
      );
    }

    const passwordToUse = initialPassword || 'admin123';
    if (!initialPassword) {
      console.warn(
        'SECURITY WARNING: Using default development credentials for admin@jkspdc.co.in. Set INITIAL_ADMIN_PASSWORD for non-dev environments.'
      );
    }

    const adminPasswordHash = hashPassword(passwordToUse);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Administrator',
        password: adminPasswordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' },
    });
    console.log('Admin user already exists (role ensured as ADMIN).');
  }


  // 2. Create Dignitaries & Board of Directors (BOD)
  const dignitaries = [
    {
      id: 'dig-manoj-sinha',
      name: 'Shri Manoj Sinha',
      position: 'Lieutenant Governor, UT of Jammu and Kashmir',
      subTitle: 'Government of Jammu & Kashmir',
      role: 'Honorable Lieutenant Governor',
      sNo: 1,
      imageUrl: '/dignitaries/manoj_sinha.png',
      iasBatch: 'Hon\'ble Lt. Governor',
      education: 'M.Tech (Civil Engineering), IIT BHU',
      officeLocation: 'Raj Bhavan, J&K',
      description: 'Shri Manoj Sinha assumed office as the Lieutenant Governor of Jammu and Kashmir on August 7, 2020. Prior to this, he served as Minister of State (Independent Charge) for Communications and Minister of State for Railways in the Government of India. He is an alumnus of IIT (BHU) Varanasi.',
      keyResponsibilities: 'Oversees overall administration, strategic state governance, law and order, and major developmental initiatives across Jammu & Kashmir.'
    },
    {
      id: 'dig-omar-abdullah',
      name: 'Shri Omar Abdullah',
      position: 'Chief Minister, UT of Jammu and Kashmir',
      subTitle: 'Minister Incharge Power Development Department',
      role: 'Honorable Chief Minister',
      sNo: 2,
      imageUrl: '/dignitaries/omar_abdullah.png',
      iasBatch: 'Chief Minister',
      education: 'B.Com (Sydenham), MBA (Strathclyde)',
      officeLocation: 'Civil Secretariat, J&K',
      description: 'Shri Omar Abdullah is the Chief Minister of Jammu & Kashmir and holds the charge of the Power Development Department. He leads key socio-economic, industrial, and infrastructure development policies across the Union Territory.',
      keyResponsibilities: 'Directs policy formulation for the energy sector, power generation projects, strategic infrastructure expansion, and executive state governance.'
    },
    {
      id: 'dig-ashwani-kumar',
      name: 'Shri Ashwani Kumar (IAS)',
      position: 'Financial Commissioner (ACS)',
      subTitle: 'Power Development Department, J&K',
      role: 'Chairman',
      sNo: 3,
      imageUrl: '/dignitaries/ashwani_kumar.png',
      iasBatch: '1992 (AGMUT Cadre)',
      education: 'B.E. (Elec.), M.A. (Duke)',
      officeLocation: 'Civil Secretariat, J&K',
      description: 'Shri Ashwani Kumar is a senior officer of the Indian Administrative Service (IAS) belonging to the 1992 batch (AGMUT cadre). He assumed charge as the Financial Commissioner (Additional Chief Secretary) of the Power Development Department, Government of Jammu and Kashmir.\n\nShri Kumar holds a Bachelor of Engineering (B.E.) in Electrical Engineering and a Master of Arts (M.A.) in International Development from Duke University, USA. His engineering credentials combined with administrative training enable him to drive strategic power sector improvements.',
      keyResponsibilities: 'Supervises the transmission, distribution, and overall generation framework within Jammu & Kashmir.\nDirects financial and administrative policies for JKSPDCL.'
    },
    {
      id: 'dig-rahul-yadav',
      name: 'Shri Rahul Yadav (IAS)',
      position: 'Managing Director, JKSPDC',
      subTitle: 'Power Development Corporation',
      role: 'Managing Director',
      sNo: 4,
      imageUrl: '/dignitaries/rahul_yadav.jpg',
      iasBatch: '2014 (AGMUT Cadre)',
      education: 'B.Tech, IIT Delhi',
      officeLocation: 'Exhibition Ground, Srinagar / Ashok Nagar, Jammu',
      description: 'Shri Rahul Yadav (IAS) serves as the Managing Director of JKSPDC. An alumnus of IIT Delhi, he guides executive management, project implementation, and corporate operations of the corporation.',
      keyResponsibilities: 'Executes corporate strategy, oversees construction and operation of hydroelectric projects, and manages joint venture investments.'
    }
  ];

  for (const dig of dignitaries) {
    await prisma.dignitary.upsert({
      where: { id: dig.id },
      create: dig,
      update: dig,
    });
  }
  console.log('Dignitaries seeded.');

  const directors = [
    {
      id: 'dir-ashwani-kumar',
      name: 'Shri Ashwani Kumar (IAS)',
      position: 'Chairman',
      role: 'Additional Chief Secretary, Power Development Department',
      sNo: 1,
    },
    {
      id: 'dir-rahul-yadav',
      name: 'Shri Rahul Yadav (IAS)',
      position: 'Managing Director',
      role: 'Managing Director, JKSPDC',
      sNo: 2,
    },
    {
      id: 'dir-pankaj-mangotra',
      name: 'Er. Pankaj Mangotra',
      position: 'Executive Director (Technical)',
      role: 'Director Technical, JKSPDC',
      sNo: 3,
    },
    {
      id: 'dir-sk-gupta',
      name: 'Shri S. K. Gupta',
      position: 'Executive Director (Finance)',
      role: 'Director Finance, JKSPDC',
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

  // 3. Power Stations (Managed exclusively via Admin Portal)
  // Optional mock stations omitted to ensure production/staging start clean.

  // 4. Gallery Items (Managed exclusively via Admin Media Gallery)
  // Mock gallery items omitted so media is populated only by administrative upload.

  // 5. Procurement Tenders (Managed exclusively via Admin Tender Portal)
  // Sample mock tenders omitted so tender listings reflect only official admin notices.

  // 6. Seed Official Contacts (Corporate Office Directory)
  const officialContacts = [
    {
      id: 'contact-seed-1',
      name: 'Shri Rahul Yadav (IAS)',
      position: 'Managing Director',
      email: 'md-jkspdcl@jk.gov.in',
      srinagarPhone: '0194-2483783',
      srinagarFax: '0194-2451665',
      jammuPhone: '0191-2430548',
      jammuFax: '0191-2435403',
      viewOrder: 1,
      isActive: true,
    },
    {
      id: 'contact-seed-2',
      name: 'Er. Javid Ahmad Dar',
      position: 'Executive Director (Electric)',
      email: 'ede@jkspdcl.com',
      srinagarPhone: '0194-2483782',
      srinagarFax: '0194-2483782',
      jammuPhone: '0191-2459549',
      jammuFax: '0191-2459549',
      viewOrder: 2,
      isActive: true,
    },
    {
      id: 'contact-seed-3',
      name: 'Er. Dev Raj Bhagat',
      position: 'Executive Director (Civil) (Chief Vigilance Officer)',
      email: 'edciviljkspdc2@gmail.com',
      srinagarPhone: '0194-2489033',
      srinagarFax: '0194-2489033',
      jammuPhone: '0191-2459534',
      jammuFax: '0191-2459534',
      viewOrder: 3,
      isActive: true,
    },
    {
      id: 'contact-seed-4',
      name: 'Smt. Santosh Kumari',
      position: 'Director Finance',
      email: 'patodfpdc@gmail.com',
      srinagarPhone: '0194-2489032',
      srinagarFax: '0194-2439474',
      jammuPhone: '0191-2435159',
      jammuFax: '0191-2435159',
      viewOrder: 4,
      isActive: true,
    },
    {
      id: 'contact-seed-5',
      name: 'Shri Sunil Gupta',
      position: 'Company Secretary',
      email: 'csjkspdcl@gmail.com',
      srinagarPhone: '0194-2483779',
      srinagarFax: '0194-2483779',
      jammuPhone: '0191-2439347',
      jammuFax: '0191-2439347',
      viewOrder: 5,
      isActive: true,
    },
    {
      id: 'contact-seed-6',
      name: 'Mrs. Roopali Puri',
      position: 'Chief General Manager (Law)',
      email: 'cgmlaw.jkspdcl@gmail.com',
      srinagarPhone: '0191-2459537',
      srinagarFax: '0191-2459537',
      jammuPhone: '0191-2459537',
      jammuFax: '0191-2459537',
      viewOrder: 6,
      isActive: true,
    },
    {
      id: 'contact-seed-7',
      name: 'Shri Akhil Dutt',
      position: 'Senior General Manager (Civil)',
      email: 'sgmciviljkspdc@gmail.com',
      srinagarPhone: '0194-2489033',
      srinagarFax: '0194-2489033',
      jammuPhone: '0191-2459534',
      jammuFax: '0191-2459534',
      viewOrder: 7,
      isActive: true,
    },
    {
      id: 'contact-seed-8',
      name: 'Mrs. Harjeet Kour',
      position: 'General Manager (Accounts) (Departmental Vigilance Officer) Jammu',
      email: 'gmajmu@gmail.com',
      srinagarPhone: '0191-2459528',
      srinagarFax: '0191-2459528',
      jammuPhone: '0191-2459528',
      jammuFax: '0191-2459528',
      viewOrder: 8,
      isActive: true,
    },
    {
      id: 'contact-seed-9',
      name: 'Sh. Dawanjeet Singh',
      position: 'Administrative Officer',
      email: 'admjkpdc@gmail.com',
      srinagarPhone: '0194-2489034',
      srinagarFax: '0194-2489034',
      jammuPhone: '0194-2489034',
      jammuFax: '0194-2489034',
      viewOrder: 9,
      isActive: true,
    },
  ];

  for (const c of officialContacts) {
    await prisma.officialContact.upsert({
      where: { id: c.id },
      create: c,
      update: c,
    });
  }
  console.log('Official contacts seeded.');

  // 7. Seed Contact Sub-Offices / Wing Contacts
  const subOffices = [
    {
      id: 'wing-seed-1',
      name: 'Generation BHEP',
      designation: 'Chief Engineer',
      email: 'ceebhep@gmail.com',
      phone: '01998288376',
      wing: 'BHEP',
      viewOrder: 1,
      isActive: true,
    },
    {
      id: 'wing-seed-2',
      name: 'Generation Jammu',
      designation: 'Chief Engineer',
      email: 'cegenjammu6@gmail.com',
      phone: '01912479899',
      wing: 'Jammu',
      viewOrder: 2,
      isActive: true,
    },
    {
      id: 'wing-seed-3',
      name: 'Generation Kashmir',
      designation: 'Chief Engineer',
      email: 'cegenkmr@gmail.com',
      phone: '01942493140',
      wing: 'Kashmir',
      viewOrder: 3,
      isActive: true,
    },
  ];

  for (const s of subOffices) {
    await prisma.contactSubOffice.upsert({
      where: { id: s.id },
      create: s,
      update: s,
    });
  }
  console.log('Contact Sub-Offices / Wing Contacts seeded.');

  // 8. Hero Carousel Slides (Managed exclusively via Admin Carousel Manager)
  // Mock hero slides omitted to keep slides fully administered.

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
