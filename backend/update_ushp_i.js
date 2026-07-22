const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating USHP I project details...');
  
  const description = `The USHP-1 (Sindh, Sumbal) Power House is located at the 56th KM mark of the Srinagar-Leh National Highway in the Jammu and Kashmir State. This power facility, with an installed capacity of 2X11.3 MWs, is powered by the waters of the River Sindh, conveyed through an 11 KM-long water conductor. The conductor has a design discharge capacity of 510 cusecs between BR-I and BR-II and 625 cusecs from BR-II to Forebay, tapped at village Kullan. Operating with a head of 149 meters at village Sumbal, the Power House utilizes vertical shaft Francis turbines supplied, installed, and commissioned by Bharat Heavy Electricals Limited, Bhopal. Unit-I became operational in December 1973, followed by the commissioning of Unit-II in July 1974, establishing the USHP-1 as a longstanding contributor to the region's power generation.`;

  const salientFeatures = `<p class="mb-4">The power house, named USHP-I, is located in Sindh, Sumbal, with the nearest airport being Srinagar. It has a capacity of 22.6 MW (2x 11.3 MW) and a design energy of 106.62 MU. The commercial operation commenced in December 1973 for Unit 1 and in July 1974 for Unit 2. The forebay/barrage is circular, with a Full Reservoir Level (FRL) of 2594.6 m and a Minimum Draw Down Level (MDDL) of 2588.1 m.</p>
<p class="mb-4">The penstocks consist of circular pipes with a diameter of 2.13 m and a length of 411.5 m. Additionally, there is a rectangular penstock with dimensions of 24' x 15' and a length of 51.2 m. The power house is of surface type and houses two generating units with a total capacity of 2x11.3 MW. The Tail Water Level (TWL) ranges from a maximum of 2445.6 m to a minimum of 2439.5 m.</p>
<p class="mb-4">The turbine is of Francis type with a rated head of 149 m, a design discharge of 339 cusecs for both Unit 1 and Unit 2, and 20 guide vanes. The generator has a rated continuous output of 14.125 MVA, operates at 11 kV, has 12 poles, a rated speed of 500 RPM, and rotates in an anticlockwise direction. The generator step-up transformer (GSU) is of single-phase type, with a voltage rating of 11/132 kV, an MVA rating of 5.667, and operates with oil-natural air-natural (ONAN) cooling.</p>
<p class="mb-4">The switchyard is of Air Insulated Switchgear (AIS) type with a voltage level of 133 kV. It includes one line, specifically the 132 kV Badampora Ganderbal single circuit line and double circuit line 132 kV Alesteng Grid.</p>`;

  const updated = await prisma.powerStation.updateMany({
    where: {
      name: {
        contains: 'USHP I',
      },
    },
    data: {
      description,
      salientFeatures,
    },
  });

  console.log(`Successfully updated ${updated.count} projects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
