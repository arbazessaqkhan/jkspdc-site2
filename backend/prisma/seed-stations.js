/**
 * One-time idempotent seed: ensures the real operational power stations
 * (the same authentic data already shipped in the website's fallback list)
 * exist in the CMS database so every page renders from the API.
 * Usage: DATABASE_URL=... node prisma/seed-stations.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function main() {
  let created = 0;
  for (const st of stations) {
    const existing = await prisma.powerStation.findUnique({ where: { id: st.id } });
    if (!existing) {
      await prisma.powerStation.create({ data: st });
      created++;
    }
  }
  console.log(`Power stations ensured: ${created} created, ${stations.length - created} already present.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
