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

  // 2. Create Dignitaries
  const dignitaries = [
    {
      id: 'dig-manoj-sinha',
      name: 'Shri Manoj Sinha',
      position: 'Lieutenant Governor, UT of Jammu and Kashmir',
      subTitle: 'Government of Jammu & Kashmir',
      role: 'Honorable Lieutenant Governor',
      sNo: 1,
      imageUrl: '/dignitaries/manoj_sinha.png',
      iasBatch: "Hon'ble Lt. Governor",
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

  // 3. Create Board of Directors (BOD)
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
      create: dir,
      update: dir,
    });
  }
  console.log('Board of Directors seeded.');

  // 4. Power Stations (13 Operational Stations)
  const stations = [
    { id: 'op-pahalgam', name: 'MHEP PAHALGAM', capacityMw: 4.5, designEnergy: 14.92, yearOfCommissioning: 2005, basin: 'Jhelum Basin', location: 'Anantnag', status: 'Operational', type: 'Hydro', configuration: '2x2.25MW' },
    { id: 'op-karnah', name: 'KARNAH', capacityMw: 2, designEnergy: 11.36, yearOfCommissioning: 1991, basin: 'Jhelum Basin', location: 'Kupwara', status: 'Operational', type: 'Hydro', configuration: '2x1MW' },
    { id: 'op-ganderbal', name: 'GANDERBAL', capacityMw: 15, designEnergy: 90.15, yearOfCommissioning: 1955, basin: 'Jhelum Basin', location: 'Ganderbal', status: 'Operational', type: 'Hydro', configuration: '2x3MW + 2x4.5MW' },
    { id: 'op-ushp-i', name: 'USHP I', capacityMw: 22.6, designEnergy: 106.62, yearOfCommissioning: 1973, basin: 'Jhelum Basin', location: 'Sumbal', status: 'Operational', type: 'Hydro', configuration: '2x11.3MW' },
    { id: 'op-ushp-ii', name: 'USHP II', capacityMw: 105, designEnergy: 447.37, yearOfCommissioning: 2000, basin: 'Jhelum Basin', location: 'Kangan', status: 'Operational', type: 'Hydro', configuration: '3x35MW' },
    { id: 'op-ljhp', name: 'LJHP', capacityMw: 105, designEnergy: 68.04, yearOfCommissioning: 1977, basin: 'Jhelum Basin', location: 'Baramulla', status: 'Operational', type: 'Hydro', configuration: '3x35MW' },
    { id: 'op-bhaderwah', name: 'BHADERWAH', capacityMw: 1.5, designEnergy: 8.32, yearOfCommissioning: 2005, basin: 'Chenab Basin', location: 'Doda', status: 'Operational', type: 'Hydro', configuration: '3x0.5MW' },
    { id: 'op-chep-iii', name: 'CHEP III', capacityMw: 7.5, designEnergy: 36.71, yearOfCommissioning: 2001, basin: 'Chenab Basin', location: 'Udhampur', status: 'Operational', type: 'Hydro', configuration: '3x2.5MW' },
    { id: 'op-chep-ii', name: 'CHEP II', capacityMw: 2, designEnergy: 12, yearOfCommissioning: 1996, basin: 'Chenab Basin', location: 'Udhampur', status: 'Operational', type: 'Hydro', configuration: '2x1MW' },
    { id: 'op-chep-i', name: 'CHEP I', capacityMw: 23.3, designEnergy: 110.02, yearOfCommissioning: 1971, basin: 'Chenab Basin', location: 'Udhampur', status: 'Operational', type: 'Hydro', configuration: '5x4.66MW' },
    { id: 'op-bhep-i', name: 'BHEP I', capacityMw: 450, designEnergy: 2536.07, yearOfCommissioning: 2008, basin: 'Chenab Basin', location: 'Ramban', status: 'Operational', type: 'Hydro', configuration: '3x150MW' },
    { id: 'op-bhep-ii', name: 'BHEP II', capacityMw: 450, designEnergy: 1302, yearOfCommissioning: 2015, basin: 'Chenab Basin', location: 'Ramban', status: 'Operational', type: 'Hydro', configuration: '3x150MW' },
    { id: 'op-sewa-iii', name: 'SEWA III', capacityMw: 9, designEnergy: 33.06, yearOfCommissioning: 2002, basin: 'Ravi Basin', location: 'Kathua', status: 'Operational', type: 'Hydro', configuration: '3x3MW' },
  ];

  for (const st of stations) {
    const existing = await prisma.powerStation.findFirst({
      where: { OR: [{ id: st.id }, { name: st.name }] },
    });
    if (!existing) {
      await prisma.powerStation.create({ data: st });
    }
  }
  console.log('Power stations seeded.');

  // 5. IPP Projects (33 Projects across Phase 1, 2, and 3)
  const ippProjects = [
    // Phase 1
    { name: 'Boniyar', capacityMw: 12, status: 'Work in progress', location: 'Baramula', awardedTo: 'Ms VRB Hydro Power', phase: 1 },
    { name: 'Ranjala Dunadi', capacityMw: 15, status: 'Commissioned.', location: 'Doda', awardedTo: 'Ms Choudhary Power Projects Limited', phase: 1 },
    { name: 'Kahmil', capacityMw: 4, status: 'Contract Terminated due to Poor Performance by Developer(2017 2018)', location: 'Kupwara', awardedTo: 'Ms Rehbar Engineering Ltd.', phase: 1 },
    { name: 'Mandi', capacityMw: 12.5, status: 'Commissioned.', location: 'Punch', awardedTo: 'Ms Magpie Hydel Constructions', phase: 1 },
    { name: 'Athwatoo', capacityMw: 10, status: 'Commissioned.', location: 'Bandipore', awardedTo: 'Ms Magpie and Co.', phase: 1 },
    { name: 'Brenwar', capacityMw: 7.5, status: 'Commissioned.', location: 'Badgam', awardedTo: 'Ms P and R Engineering', phase: 1 },
    { name: 'Aharbal', capacityMw: 22.5, status: 'Project Site surrendered due to Tourism and Environmental issues.', location: 'Pulwama', awardedTo: 'Ms JAL', phase: 1 },
    { name: 'Drung', capacityMw: 5, status: 'Land Acquisition clearance in Progress.', location: 'Kathua', awardedTo: 'Ms Chenab Valley Leasing Company.', phase: 1 },

    // Phase 2
    { name: 'Chandanwari', capacityMw: 7, status: 'DPR under preparation', location: 'Baramula', awardedTo: 'Ms Nazir Hussain Khan', phase: 2 },
    { name: 'Ans I', capacityMw: 40, status: 'Implementation agreement was signed and DPR under preparation', location: 'Riasi', awardedTo: 'Ms Sri Awantika Consortium', phase: 2 },
    { name: 'Girjan Ki Gali', capacityMw: 12, status: 'DPR under preparation', location: 'Rajaori', awardedTo: 'Ms Raheja Power Ventures Pvt Ltd', phase: 2 },
    { name: 'Patnazi Bunjwa', capacityMw: 21, status: 'TEC accorded to DPR', location: 'Kishtwar', awardedTo: 'Ms Patnazi Power (Energo Group)', phase: 2 },

    // Phase 3
    { name: 'Chingus II', capacityMw: 3, status: 'No Response', location: 'Rajaori', awardedTo: '—', phase: 3 },
    { name: 'Pumbai Aridajan', capacityMw: 4, status: 'No Response', location: 'Kulgam', awardedTo: '—', phase: 3 },
    { name: 'Hanswar', capacityMw: 6, status: 'No Response', location: 'Kishtwar', awardedTo: '—', phase: 3 },
    { name: 'Phagla', capacityMw: 16, status: 'No Response. (Project is being implemented under PMDP 2015)', location: 'Punch', awardedTo: '—', phase: 3 },
    { name: 'Mawar', capacityMw: 10, status: 'Non Responsive Bid', location: 'Kupwara', awardedTo: '—', phase: 3 },
    { name: 'Kutbal', capacityMw: 4, status: 'No Response', location: 'Kulgam', awardedTo: '—', phase: 3 },
    { name: 'Shaliganga', capacityMw: 4.5, status: 'No Response', location: 'Badgam', awardedTo: '—', phase: 3 },
    { name: 'Thanamandi', capacityMw: 2.75, status: 'No Response', location: 'Thanna Mandi', awardedTo: '—', phase: 3 },
    { name: 'Boniyar II', capacityMw: 6, status: 'No Response', location: 'Baramula', awardedTo: '—', phase: 3 },
    { name: 'Gulabgarh', capacityMw: 6.5, status: 'Bidder did not pay upfront premium. LOA Withdrawn. To be retendered.', location: 'Riasi', awardedTo: 'Ms Boom Systems Pvt.', phase: 3 },
    { name: 'Kutimarg', capacityMw: 7.25, status: 'No Response', location: 'Kulgam', awardedTo: '—', phase: 3 },
    { name: 'Shranz', capacityMw: 10, status: 'Bidder did not pay upfront premium. LOA Withdrawn. To be retendered.', location: 'Baramula', awardedTo: 'Ms Trumboo Cement Industries pvt. Ltd.', phase: 3 },
    { name: 'Upper Ans I', capacityMw: 5.5, status: 'No Response', location: 'Rajaori', awardedTo: '—', phase: 3 },
    { name: 'Shunahkag', capacityMw: 9, status: 'Bidder did not pay upfront premium. LOA Withdrawn.', location: 'Badgam', awardedTo: 'Ms Boom Systems Pvt. Ltd.', phase: 3 },
    { name: 'Chingus I', capacityMw: 3, status: 'No Response', location: 'Rajaori', awardedTo: '—', phase: 3 },
    { name: 'Sultanphatri', capacityMw: 3, status: 'DPR under preparation', location: 'Punch', awardedTo: 'Ms SRM Contractors Pvt. Ltd.', phase: 3 },
    { name: 'Sewa I', capacityMw: 8, status: 'Non Responsive Bid', location: 'Kathua', awardedTo: '—', phase: 3 },
    { name: 'Erin', capacityMw: 10, status: 'No Response', location: 'Bandipore', awardedTo: '—', phase: 3 },
    { name: 'Nihama', capacityMw: 6, status: 'Bidder did not pay upfront premium. LOA Withdrawn.', location: 'Kulgam', awardedTo: 'Ms Middle East Recycling Company WILL.', phase: 3 },
    { name: 'Chenani IV', capacityMw: 7, status: 'Non Responsive Bid.', location: 'Udhampur', awardedTo: '—', phase: 3 },
    { name: 'Bringi', capacityMw: 4, status: 'No Response', location: 'Anantnag', awardedTo: '—', phase: 3 }
  ];

  for (const p of ippProjects) {
    const existing = await prisma.ippProject.findFirst({
      where: { name: p.name, phase: p.phase },
    });
    if (!existing) {
      await prisma.ippProject.create({ data: p });
    }
  }
  console.log('IPP Projects seeded.');

  // 6. Official Contacts (Corporate Office Directory)
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

  // 7. Contact Sub-Offices / Wing Contacts
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

  // 8. Downloads & Policies
  const initialDownloads = [
    {
      title: 'NIT Upload Request Form',
      category: 'Downloads',
      description: 'Official form and instructions required for submitting NIT, e-NIT Gist, Quotations, or Corrigenda for upload to the web portal via webupdates[at]jkspdcl[dot]com.',
      fileName: 'NIT Upload Request Form.pdf',
      documentUrl: '/NIT Upload Request Form.pdf',
      status: 'Active',
    },
    {
      title: 'User Creation',
      category: 'Downloads',
      description: 'Requisite details form and instructions for generating user credentials and mapping digital signature certificates on jktenders.gov.in website.',
      fileName: 'User Creation.pdf',
      documentUrl: '/User Creation.pdf',
      status: 'Active',
    },
    {
      title: 'Whistle Blower Policy',
      category: 'Policies',
      description: 'Framework establishing a transparent vigilance mechanism for safeguarding the corporation against malpractices, abuse of authority, and corporate threats.',
      fileName: 'Whistle Blower Policy.pdf',
      documentUrl: '/Whistle Blower Policy.pdf',
      status: 'Active',
    },
  ];

  for (const item of initialDownloads) {
    const existing = await prisma.download.findFirst({
      where: { title: item.title },
    });
    if (!existing) {
      await prisma.download.create({ data: item });
    }
  }
  console.log('Downloads & Policies seeded.');

  // 9. Policy Documents (MoA & AoA)
  const initialPolicies = [
    {
      id: 'policy-moa-aoa',
      title: 'Memorandum & Articles of Association (MoA & AoA)',
      description: 'Official certified copies showing legal incorporation clauses under the Companies Act.',
      category: 'Memorandum',
      documentUrl: '/MoA_AoA.pdf',
      status: 'Active',
    },
  ];

  for (const pol of initialPolicies) {
    await prisma.policyDocument.upsert({
      where: { id: pol.id },
      create: pol,
      update: {},
    });
  }
  console.log('Policy Documents (MoA & AoA) seeded.');

  // 10. Gallery Items (6 authentic corporation photos)
  const initialGallery = [
    {
      id: 'gallery-seed-1',
      title: 'Signing of Implementation Agreement for Execution of Hydroelectric Projects NHPC Ltd. and JKSPDC',
      imageUrl: '/gallery/signing_agreement.png',
      partition: 'Official Events',
      status: 'Active',
      displayOrder: 1,
    },
    {
      id: 'gallery-seed-2',
      title: 'Retirement Ceremony of Executive Director Civil, JKSPDC',
      imageUrl: '/gallery/retirement_ed_civil.png',
      partition: 'Corporate',
      status: 'Active',
      displayOrder: 2,
    },
    {
      id: 'gallery-seed-3',
      title: 'Hydroelectric Power Infrastructure & Projects Overview',
      imageUrl: '/gallery/projects_gallery.jpg',
      partition: 'Projects',
      status: 'Active',
      displayOrder: 3,
    },
    {
      id: 'gallery-seed-4',
      title: 'Baglihar Hydro Electric Project (BHEP) Stage-I & II Dam Site',
      imageUrl: '/projects/bhep-i.jpg',
      partition: 'Projects',
      status: 'Active',
      displayOrder: 4,
    },
    {
      id: 'gallery-seed-5',
      title: 'Corporate HQ and Administrative Building, Srinagar & Jammu',
      imageUrl: '/slider2.jpg',
      partition: 'Corporate',
      status: 'Active',
      displayOrder: 5,
    },
    {
      id: 'gallery-seed-6',
      title: 'Official Executive Board Meeting & Review Conference',
      imageUrl: '/slider3.jpg',
      partition: 'Official Events',
      status: 'Active',
      displayOrder: 6,
    },
  ];

  for (const gal of initialGallery) {
    await prisma.galleryItem.upsert({
      where: { id: gal.id },
      create: gal,
      update: {},
    });
  }
  console.log('Gallery Items seeded.');

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
