const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialIppProjects = [
  // Phase 1 (From legacy screenshot)
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

async function seed() {
  const existingCount = await prisma.ippProject.count();
  if (existingCount === 0) {
    console.log(`Seeding ${initialIppProjects.length} initial IPP projects...`);
    for (const project of initialIppProjects) {
      await prisma.ippProject.create({ data: project });
    }
    console.log('IPP Projects successfully seeded!');
  } else {
    console.log(`IPP Projects already has ${existingCount} records. Skipping seed.`);
  }
}

seed()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
