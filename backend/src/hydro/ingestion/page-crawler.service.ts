import { Injectable, Logger } from '@nestjs/common';
import { ChunkerService } from './chunker.service';
import { EmbeddingService } from '../services/embedding.service';
import { VectorStoreService } from '../services/vector-store.service';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';

interface StaticRouteInfo {
  url: string;
  title: string;
  category: string;
  content: string;
}

/**
 * Page Crawler Service — Crawls and indexes approved website pages into HYDRO knowledge base.
 */
@Injectable()
export class PageCrawlerService {
  private readonly logger = new Logger(PageCrawlerService.name);

  private readonly corePages: StaticRouteInfo[] = [
    {
      url: '/about-us/explore/overview',
      title: 'Corporate Overview & Legacy',
      category: 'About Us',
      content: `# Corporate Overview & Legacy of JKSPDCL\n\nJammu and Kashmir State Power Development Corporation Limited (JKSPDCL) is a wholly owned Public Sector Undertaking of the Government of Jammu & Kashmir, incorporated under the Companies Act in February 1995.\n\n## Mandate & Scope\nJKSPDCL was incorporated with the specific mandate to plan, construct, operate, and maintain power generating stations, power projects, transmission lines, and sub-stations across Jammu, Kashmir, and Ladakh.\n\n## Historical Legacy\nThe Corporation inherited the historic Mohra Hydroelectric Plant, established in 1905 with a capacity of 3 MW on the Jhelum River in Baramulla. It is one of the oldest hydroelectric installations in Asia.\n\n## Capital Structure\n- Authorised Share Capital: Rs. 5000 Crore (Rs. 50 Billion)\n- Shareholding: 100% owned by the Government of Jammu & Kashmir\n- Total Generation Portfolio: 2593 MW across operational, under-construction, and Joint Venture projects.`,
    },
    {
      url: '/about-us/explore/gstin-registration',
      title: 'GSTIN Registration Details',
      category: 'About Us',
      content: `# GSTIN Registration Details — JKSPDCL\n\n## Corporate Identification & Tax Registration Profile\n- **Legal Entity Name:** Jammu & Kashmir State Power Development Corporation Limited\n- **Primary GSTIN (J&K):** 01AACCJ5612K1ZX\n- **Corporate Identification Number (CIN):** U40101JK1995SGC001418\n- **Permanent Account Number (PAN):** AACCJ5612K\n- **Taxpayer Type:** State Government Undertaking / Public Sector Undertaking\n- **Registered Head Offices:**\n  - Srinagar Office: Exhibition Ground, Jahangir Chowk, Srinagar, J&K — 190009\n  - Jammu Office: Ashok Nagar, Satwari, Jammu, J&K — 180004\n\n## Tax Invoicing & Compliance Note\nAll vendors, suppliers, contractors, and power beneficiaries must quote GSTIN 01AACCJ5612K1ZX on all commercial invoices, contract billing claims, and statutory filings.`,
    },
    {
      url: '/about-us/explore/vision',
      title: 'Corporate Vision & Clean Energy Targets',
      category: 'About Us',
      content: `# Corporate Vision & Clean Energy Targets\n\n## Vision Statement\nTo be a premier, financially viable, and sustainable clean energy corporation in India, driving socio-economic prosperity across Jammu & Kashmir by harnessing water resources and renewable energy in an environmentally sound manner.\n\n## Strategic Targets\n- Achieve power self-sufficiency for Jammu & Kashmir by 2030.\n- Expand total installed generation capacity beyond 4,000 MW through cascading hydel and solar hybrid projects.\n- Minimize environmental impact by adopting strict Run-of-the-River (RoR) designs adhering to the Indus Waters Treaty.`,
    },
    {
      url: '/about-us/explore/mission',
      title: 'Corporate Mission & Operational Priorities',
      category: 'About Us',
      content: `# Corporate Mission & Operational Priorities\n\n## Mission Statement\n- Efficiently execute hydroelectric, thermal, and non-conventional power generation schemes.\n- Maintain international standards of safety, quality, and environmental stewardship.\n- Foster professional excellence, integrity, and transparency in corporate governance.\n- Optimize power output from existing power stations through Renovation, Modernisation & Uprating (RM&U).`,
    },
    {
      url: '/about-us/explore/association-memorandum',
      title: 'Memorandum and Articles of Association (MoA & AoA)',
      category: 'About Us',
      content: `# Memorandum and Articles of Association (MoA & AoA)\n\n## Legal Foundation\nJKSPDCL was incorporated under the Companies Act 1956 in February 1995 as a government company.\n\n## Core Objects of the Corporation (MoA)\n1. To carry on all the business of establishing, operating, and maintaining power generating stations and supply systems.\n2. To investigate, plan, design, execute, and operate hydro, thermal, solar, wind, and tidal power projects.\n3. To enter into joint ventures, agreements, and power purchase contracts with state and central agencies (NHPC, CVPPPL, PGCIL, CEA, MoP).`,
    },
    {
      url: '/about-us/explore/organization-chart',
      title: 'Organizational Structure & Governance Hierarchy',
      category: 'About Us',
      content: `# Organizational Structure & Governance Hierarchy\n\n## Governance Structure\n- **Patron:** Hon'ble Lieutenant Governor, UT of J&K\n- **Chairman / Energy Reviews:** Hon'ble Chief Minister, UT of J&K\n- **Managing Director (MD):** Senior IAS Officer heading all administrative, technical, and commercial operations.\n- **Director Finance:** Overseeing corporate accounts, financial planning, tariff petitions, and statutory audits.\n- **Executive Directors:** Heading Technical Wings (Civil, Electrical, Mechanical, Contracts, Power Trading, and Project Execution).`,
    },
    {
      url: '/about-us/explore/rti',
      title: 'Right to Information Act Section 4 Disclosures',
      category: 'About Us',
      content: `# Right to Information Act (RTI) Section 4 Disclosures\n\n## Statutory Disclosures under Section 4(1)(b) of RTI Act 2005\nJKSPDCL complies with mandatory proactive disclosures:\n- **Public Information Officers (PIOs):** Nominated senior officers at Corporate HQ Srinagar, Corporate HQ Jammu, and all major project divisions.\n- **First Appellate Authority (FAA):** Executive Director (Administration), Corporate Office.\n- **RTI Application Mode:** Applications can be submitted in writing along with prescribed fee (Demand Draft / Postal Order) or filed through the J&K RTI online portal.\n- **Office Hours for Public Interface:** 10:00 AM to 5:00 PM on all working days.`,
    },
    {
      url: '/commercial/overview',
      title: 'Commercial Operations & Power Trading',
      category: 'Commercial',
      content: `# Commercial Operations & Power Trading\n\n## Commercial Mandate\nThe Commercial Wing of JKSPDCL is responsible for energy accounting, tariff fixation, billing realization, power purchase agreements (PPAs), and power scheduling with the Northern Regional Load Despatch Centre (NRLDC).\n\n## Regulatory Framework\n- Commercial tariffs are determined by the Joint Electricity Regulatory Commission for UT of J&K and UT of Ladakh (JERC) and Central Electricity Regulatory Commission (CERC).\n- Power is supplied primarily to DISCOMs: Kashmir Power Distribution Corporation Limited (KPDCL) and Jammu Power Distribution Corporation Limited (JPDCL).`,
    },
    {
      url: '/sustainability/csr/overview',
      title: 'Corporate Social Responsibility (CSR) & Environment Policy',
      category: 'Sustainability',
      content: `# Corporate Social Responsibility (CSR) & Environment Policy\n\n## CSR Commitment\nJKSPDCL allocates a minimum of 2% of its average net profit towards Corporate Social Responsibility initiatives as per the Companies Act 2013.\n\n## Key CSR Focus Areas\n1. Rural community development around project catchments.\n2. Healthcare, drinking water facilities, and public sanitation.\n3. Skill development and education support in remote hydel project areas.\n4. Environmental protection: Catchment Area Treatment (CAT) and Compensatory Afforestation.\n\n## Environmental Clearances\nAll hydel projects comply with MoEF&CC environmental guidelines and State Pollution Control Board requirements.`,
    },
    {
      url: '/stakeholders/vendors/msme-corner',
      title: 'Startups & MSME Corner',
      category: 'Vendors',
      content: `# Startups & MSME Corner\n\n## MSME Facilitation & Exemptions\nIn accordance with Government of India and UT Procurement Guidelines:\n- **EMD Exemption:** Micro and Small Enterprises (MSEs) registered with UDYAM or NSIC are exempt from submission of Earnest Money Deposit (EMD) in public tenders for eligible works/supplies.\n- **Tender Fee Exemption:** Tender document cost is waived for verified MSEs.\n- **Purchase Preference:** MSEs participating in tenders get purchase preference subject to statutory norms.`,
    },
    {
      url: '/employees-corner',
      title: 'Employees Corner — Official Online Portals & Links',
      category: 'Employees Corner',
      content: `# Employees Corner — Official Online Portals & Quick Links\n\nJKSPDCL provides online digital services and administrative management portals for its officers and employees:\n\n1. **Web Mail:** Official departmental email service for corporate communication.\n   - **URL / Login:** https://www.jkspdcl.com:2096/\n\n2. **Nic-e-File:** National Informatics Centre electronic file movement and tracking system.\n   - **URL / Login:** https://saccess.nic.in/\n\n3. **E-Office (J&K Govt):** Digital file processing, electronic movement, and government approvals.\n   - **URL / Login:** https://eoffice.jk.gov.in/\n\n4. **JKHMRS (Human Resource Management System):** Employee service records, leaves, promotions, and salary records.\n   - **URL / Login:** https://hrms.jk.gov.in/\n\n5. **Property Return (GAD):** Annual immovable property returns filing portal under General Administration Department (GAD).\n   - **URL / Login:** https://prs.jk.gov.in/\n\n6. **EETMS (E-Efficiency Tracking Management System):** Project monitoring and legal case management portal.\n   - **URL / Login:** https://law.pmgatishakti.gov.in/EETMS/login\n\n7. **BG Management (Bank Guarantee Management):** Online bank guarantee verification and tracking system.\n   - **URL / Login:** https://bg.jkspdc.in/\n\n8. **Asset Management:** Fixed assets, equipment, and plant inventory management portal.\n   - **URL / Login:** https://jkspdc.inrdeals.in/login\n\nAll employees can access these portals directly through the Employees Corner dropdown menu on the top navigation bar.`,
    },
    {
      url: '/our-business/power-potential',
      title: 'Hydroelectric Potential & Power Generation in Jammu & Kashmir',
      category: 'Our Business',
      content: `# Hydroelectric Potential & Power Generation in Jammu & Kashmir\n\n## Total Identified Hydroelectric Potential\n- **Total Hydro Potential of J&K:** Estimated at approximately **20,000 MW** across four major river basins: **Chenab, Jhelum, Ravi, and Indus**.\n- **Economically Exploitable Potential (CEA Assessed):** The Central Electricity Authority (CEA) has assessed **14,867 MW** of economically viable hydel potential in J&K.\n- **Basin-wise Distribution of Potential:**\n  - **Chenab Basin:** ~10,360 MW (highest potential, major cascading projects like Baglihar, Sawalkote, Ratle, Pakal Dul, Kiru, Kwar, Dul Hasti, Salal)\n  - **Jhelum Basin:** ~3,060 MW (Lower Jhelum, Upper Sindh, Uri, Kishanganga, Mohra)\n  - **Ravi Basin:** ~500 MW (Sewa-II, Sewa-III)\n  - **Indus & Ladakh tributaries:** ~947 MW\n\n## JKSPDCL Generation Capacity & Assets\n- **Total Portfolio:** **2,593 MW** (including operational, under-construction, and Joint Venture projects).\n- **Operational Capacity:** **1,197.40 MW** across 13 active hydroelectric power stations.\n- **Major Operational Power Stations:**\n  1. **Baglihar HEP Stage-I (BHEP-I):** 450 MW (3x150 MW), Chenab Basin, Ramban\n  2. **Baglihar HEP Stage-II (BHEP-II):** 450 MW (3x150 MW), Chenab Basin, Ramban — Total Baglihar complex = **900 MW**\n  3. **Lower Jhelum HEP (LJHP):** 105 MW (3x35 MW), Jhelum Basin, Baramulla\n  4. **Upper Sindh HEP-II (USHP-II):** 105 MW (3x35 MW), Sindh River, Kangan / Ganderbal\n  5. **Upper Sindh HEP-I (USHP-I):** 22.60 MW, Sumbal\n  6. **Ganderbal HEP:** 15 MW, Ganderbal\n  7. **Hanu HEP:** 10.5 MW, Hanu\n  8. **Chenani HEP-I (CHEP-I):** 9.2 MW (5 units), Udhampur\n  9. **Sewa-III HEP:** 9 MW (3x3 MW), Ravi Basin, Kathua\n  10. **Pahalgam HEP:** 3 MW, Lidder River, Anantnag\n  11. **Karnah HEP:** 2 MW, Kupwara\n  12. **Bhaderwah HEP:** 1.5 MW, Doda\n  13. **Sanjak HEP:** 1.26 MW\n  14. **Historic Mohra HEP:** 3 MW (1905, Asia's pioneer hydro station)\n\n## Projects Under Development & Joint Ventures\n- **Sawalkote HEP:** 1,856 MW (Chenab Basin)\n- **Kirthai-II HEP:** 930 MW (Chenab Basin, Kishtwar)\n- **Kirthai-I HEP:** 390 MW (Chenab Basin, Kishtwar)\n- **Joint Venture with CVPPPL (NHPC + JKSPDC):** Pakal Dul (1,000 MW), Kiru (624 MW), Kwar (540 MW), Ratle (850 MW).`,
    },
    {
      url: '/about-us/others/contact',
      title: 'Contact Corporate Offices & Helpline',
      category: 'Contact',
      content: `# Contact Corporate Offices & Helpline\n\n## Srinagar Corporate Office\n- **Address:** Exhibition Ground, Jahangir Chowk, Srinagar, J&K — 190009\n- **Phone:** +91 194 2451665\n- **Official Email:** md-jkspdcl@jk.gov.in\n\n## Jammu Corporate Office\n- **Address:** Ashok Nagar, Satwari, Jammu, J&K — 180004\n- **Phone:** +91 191 2430548 / +91 191 2439039\n- **Official Email:** md-jkspdcl@jk.gov.in\n\n## Website Information & IT Cell\n- **Technical Support:** IT Cell, JKSPDCL, Corporate Office Srinagar / Jammu.`,
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly chunker: ChunkerService,
    private readonly embedding: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  /**
   * Indexes all approved core pages into the knowledge base.
   */
  async indexCorePages(): Promise<{ indexedPages: number; totalChunks: number }> {
    let indexedPages = 0;
    let totalChunks = 0;

    for (const page of this.corePages) {
      const contentHash = crypto.createHash('sha256').update(page.content).digest('hex');

      const existing = await this.prisma.hydroDocument.findFirst({
        where: { sourceUrl: page.url, sourceType: 'page' },
      });

      if (existing && existing.contentHash === contentHash) {
        continue;
      }

      if (existing) {
        this.vectorStore.removeByDocumentId(existing.id);
        await this.prisma.hydroChunk.deleteMany({ where: { documentId: existing.id } });
      }

      const doc = existing
        ? await this.prisma.hydroDocument.update({
            where: { id: existing.id },
            data: {
              title: page.title,
              category: page.category,
              contentHash,
              lastUpdated: new Date(),
            },
          })
        : await this.prisma.hydroDocument.create({
            data: {
              title: page.title,
              sourceUrl: page.url,
              sourceType: 'page',
              documentType: 'webpage',
              category: page.category,
              contentHash,
            },
          });

      const chunks = this.chunker.chunkText(page.content, page.title);
      const embeddings = await this.embedding.embedBatch(chunks.map(c => c.content));

      for (let i = 0; i < chunks.length; i++) {
        const item = chunks[i];
        const emb = embeddings[i];

        const chunkRecord = await this.prisma.hydroChunk.create({
          data: {
            documentId: doc.id,
            chunkIndex: item.chunkIndex,
            content: item.content,
            heading: item.heading,
          },
        });

        if (emb) {
          this.vectorStore.addVector(chunkRecord.id, emb, {
            id: chunkRecord.id,
            documentId: doc.id,
            chunkIndex: item.chunkIndex,
            heading: item.heading,
          });
        }
      }

      indexedPages++;
      totalChunks += chunks.length;
    }

    await this.vectorStore.saveIndex();
    this.logger.log(`Core pages indexed: ${indexedPages} pages, ${totalChunks} chunks generated.`);
    return { indexedPages, totalChunks };
  }
}
