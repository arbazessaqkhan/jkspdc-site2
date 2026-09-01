import { Injectable, Logger } from '@nestjs/common';
import { ChunkerService } from './chunker.service';
import { EmbeddingService } from '../services/embedding.service';
import { VectorStoreService } from '../services/vector-store.service';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';

export interface StaticRouteInfo {
  url: string;
  title: string;
  category: string;
  content: string;
  keywords?: string[];
}

/**
 * Page Crawler Service — Authoritative repository of ALL approved website pages with 100% real URLs.
 */
@Injectable()
export class PageCrawlerService {
  private readonly logger = new Logger(PageCrawlerService.name);

  // Authoritative registry of all real website routes
  readonly corePages: StaticRouteInfo[] = [
    // ── About Us ──────────────────────────────────────────────────────────
    {
      url: '/about-us/explore/overview',
      title: 'Corporate Overview & Legacy',
      category: 'About Us',
      keywords: ['overview', 'history', 'mohra', 'legacy', 'capital', 'share capital', '5000 crore', 'incorporation', 'mandate', 'potentials', 'capacity'],
      content: `# Corporate Overview & Legacy of JKSPDCL\n\nJammu and Kashmir State Power Development Corporation Limited (JKSPDCL) is a wholly owned Public Sector Undertaking of the Government of Jammu & Kashmir, incorporated under the Companies Act in February 1995.\n\n## Mandate & Scope\nJKSPDCL was incorporated with the specific mandate to plan, construct, operate, and maintain power generating stations, power projects, transmission lines, and sub-stations across Jammu, Kashmir, and Ladakh.\n\n## Historical Legacy\nThe Corporation inherited the historic Mohra Hydroelectric Plant, established in 1905 with a capacity of 3 MW on the Jhelum River in Baramulla. It is one of the oldest hydroelectric installations in Asia.\n\n## Capital Structure & Generation Portfolio\n- **Authorised Share Capital:** Rs. 5000 Crore (Rs. 50 Billion)\n- **Shareholding:** 100% owned by the Government of Jammu & Kashmir\n- **Total Generation Portfolio:** 2,593 MW across operational, under-construction, and Joint Venture projects.\n- **Operational Capacity:** 1,197.40 MW across 13 active hydroelectric power stations.`,
    },
    {
      url: '/about-us/explore/gstin-registration',
      title: 'GSTIN Registration Details',
      category: 'About Us',
      keywords: ['gst', 'gstin', 'tax', 'taxation', 'pan', 'cin', 'goods and services tax', 'invoice', 'tin'],
      content: `# GSTIN Registration Details — JKSPDCL\n\n## Corporate Identification & Tax Registration Profile\n- **Legal Entity Name:** Jammu & Kashmir State Power Development Corporation Limited\n- **Primary GSTIN (J&K):** 01AACCJ5612K1ZX\n- **Corporate Identification Number (CIN):** U40101JK1995SGC001418\n- **Permanent Account Number (PAN):** AACCJ5612K\n- **Taxpayer Type:** State Government Undertaking / Public Sector Undertaking\n- **Registered Head Offices:**\n  - Srinagar Office: Exhibition Ground, Jahangir Chowk, Srinagar, J&K — 190009\n  - Jammu Office: Ashok Nagar, Satwari, Jammu, J&K — 180004\n\n## Tax Invoicing & Compliance Note\nAll vendors, suppliers, contractors, and power beneficiaries must quote GSTIN 01AACCJ5612K1ZX on all commercial invoices, contract billing claims, and statutory filings.`,
    },
    {
      url: '/about-us/explore/vision',
      title: 'Corporate Vision & Clean Energy Targets',
      category: 'About Us',
      keywords: ['vision', 'targets', 'clean energy', '2030', '4000 mw', 'self sufficiency'],
      content: `# Corporate Vision & Clean Energy Targets\n\n## Vision Statement\nTo be a premier, financially viable, and sustainable clean energy corporation in India, driving socio-economic prosperity across Jammu & Kashmir by harnessing water resources and renewable energy in an environmentally sound manner.\n\n## Strategic Targets\n- Achieve power self-sufficiency for Jammu & Kashmir by 2030.\n- Expand total installed generation capacity beyond 4,000 MW through cascading hydel and solar hybrid projects.\n- Minimize environmental impact by adopting strict Run-of-the-River (RoR) designs adhering to the Indus Waters Treaty.`,
    },
    {
      url: '/about-us/explore/mission',
      title: 'Corporate Mission & Operational Priorities',
      category: 'About Us',
      keywords: ['mission', 'objectives', 'priorities', 'standards', 'modernisation', 'rmu'],
      content: `# Corporate Mission & Operational Priorities\n\n## Mission Statement\n- Efficiently execute hydroelectric, thermal, and non-conventional power generation schemes.\n- Maintain international standards of safety, quality, and environmental stewardship.\n- Foster professional excellence, integrity, and transparency in corporate governance.\n- Optimize power output from existing power stations through Renovation, Modernisation & Uprating (RM&U).`,
    },
    {
      url: '/about-us/explore/profile',
      title: 'Corporate Profile',
      category: 'About Us',
      keywords: ['profile', 'company profile', 'incorporation date', 'status'],
      content: `# Corporate Profile — JKSPDCL\n\n- **Full Legal Name:** Jammu & Kashmir State Power Development Corporation Limited\n- **Year of Incorporation:** February 1995\n- **Administrative Department:** Power Development Department (PDD), Government of J&K\n- **Corporate Identity:** State-owned Power Generating Utility\n- **Registered Office (Srinagar):** Exhibition Ground, Srinagar — 190009\n- **Camp Office (Jammu):** Ashok Nagar, Satwari, Jammu — 180004.`,
    },
    {
      url: '/about-us/explore/objectives',
      title: 'Main Corporate Objectives',
      category: 'About Us',
      keywords: ['objectives', 'main objectives', 'aims', 'goals'],
      content: `# Main Corporate Objectives\n\n1. To plan, investigate, execute, generate, operate, and maintain power stations in UT of J&K.\n2. To harness untapped hydro potential in the Chenab, Jhelum, Ravi, and Indus river basins.\n3. To enter into Joint Ventures with central PSUs (NHPC) for mega hydel projects.\n4. To trade bulk electricity with DISCOMs (KPDCL & JPDCL) and national power grids.`,
    },
    {
      url: '/about-us/explore/organization-chart',
      title: 'Organization Chart & Governance Hierarchy',
      category: 'About Us',
      keywords: ['organization chart', 'hierarchy', 'organogram', 'structure', 'management hierarchy'],
      content: `# Organization Chart & Governance Hierarchy\n\n- **Patron:** Hon'ble Lieutenant Governor, UT of J&K\n- **Policy & Reviews:** Hon'ble Chief Minister, UT of J&K\n- **Managing Director (MD):** Senior IAS Officer heading all corporate affairs.\n- **Director Finance:** Head of Corporate Finance, Accounts, Audits, and Tariffs.\n- **Executive Directors:** ED (Civil), ED (Electrical), ED (Commercial & Contracts).\n- **Chief Engineers:** Heading Project Wings (Baglihar, Sawalkote, Kargil/Leh, Civil Investigation).`,
    },
    {
      url: '/about-us/explore/roles-responsibility',
      title: 'Roles & Responsibilities of Wings',
      category: 'About Us',
      keywords: ['roles', 'responsibilities', 'duties', 'wings', 'departments'],
      content: `# Roles & Responsibilities of Corporate Wings\n\n- **Civil Engineering Wing:** Survey, DPR formulation, dam construction, tunnel design, and catchment treatment.\n- **Electrical & Mechanical Wing:** Generator procurement, turbine maintenance, switchyard operation, and grid synchronization.\n- **Commercial & Trading Wing:** Power Purchase Agreements (PPAs), Joint Meter Reading (JMR), tariff filings before JERC/CERC.\n- **Finance & Accounts Wing:** Budget allocation, statutory audits, fund management, and billing realizations.\n- **Human Resources & Admin Wing:** Personnel service records, promotions, training, and RTI compliance.`,
    },
    {
      url: '/about-us/explore/executives-directory',
      title: 'Phone Directory of Senior Executives',
      category: 'About Us',
      keywords: ['phone directory', 'contacts', 'executives', 'phone numbers', 'email directory', 'chief engineer phone'],
      content: `# Phone Directory of Senior Executives\n\nOfficial contact registry for public interface, headquarters, and project divisions in Srinagar and Jammu.\n- **Managing Director:** md-jkspdcl[at]jk[dot]gov[dot]in | Phone: +91 194 2451665 / +91 191 2430548\n- **Director Finance:** df-jkspdcl[at]jk[dot]gov[dot]in\n- **Executive Director (Civil / Electrical):** ed-jkspdcl[at]jk[dot]gov[dot]in\n- **Company Secretary & Public Information Officer (PIO):** Contact at Corporate HQ Srinagar / Jammu.`,
    },
    {
      url: '/about-us/explore/ethics-code',
      title: 'Code of Business Conduct & Ethics',
      category: 'About Us',
      keywords: ['ethics', 'code of conduct', 'integrity', 'anti-corruption', 'employee conduct'],
      content: `# Code of Business Conduct & Ethics\n\nGuidelines governing all directors, officers, contractors, and employees of JKSPDCL:\n- Absolute honesty, transparency, and integrity in public procurement and contract execution.\n- Strict adherence to vigilance and anti-corruption guidelines.\n- Prohibition of conflict of interest in tender evaluations and commercial decisions.\n- Protection of corporate assets, environmental sustainability, and safety protocols.`,
    },
    {
      url: '/about-us/explore/association-memorandum',
      title: 'Memorandum and Articles of Association (MoA & AoA)',
      category: 'About Us',
      keywords: ['moa', 'aoa', 'memorandum of association', 'articles of association', 'constitution'],
      content: `# Memorandum and Articles of Association (MoA & AoA)\n\nFoundational legal constitution documents under the Companies Act governing the incorporation, powers, share capital, and borrowing authority of JKSPDCL.`,
    },
    {
      url: '/about-us/explore/policies',
      title: 'Corporate Policies Directory',
      category: 'About Us',
      keywords: ['policies', 'corporate policies', 'vigilance', 'safety policy', 'procurement policy'],
      content: `# Corporate Policies Directory\n\nCentral directory of official corporation policies covering Corporate Social Responsibility (CSR), Environmental Management, Safety at Hydel Projects, Whistleblower mechanism, and MSME procurement guidelines.`,
    },
    {
      url: '/about-us/explore/rti',
      title: 'Right to Information Act (RTI) Section 4 Disclosures',
      category: 'About Us',
      keywords: ['rti', 'right to information', 'section 4', 'pio', 'public information officer', 'appellate authority'],
      content: `# Right to Information Act (RTI) Section 4 Disclosures\n\nStatutory disclosures under Section 4(1)(b) of the RTI Act 2005. Details of nominated Public Information Officers (PIOs) and First Appellate Authorities (FAAs) across Srinagar, Jammu, and project divisions.`,
    },
    {
      url: '/about-us/management/board',
      title: 'Board of Directors & Governance',
      category: 'About Us',
      keywords: ['board of directors', 'directors', 'manoj sinha', 'omar abdullah', 'pankaj kumar sharma', 'ashwani kumar', 'rahul yadav', 'leadership'],
      content: `# Board of Directors & Governance\n\nThe Board of Directors oversees the policy, financial governance, and strategic growth of JKSPDCL:\n- **Hon'ble Lt. Governor Shri Manoj Sinha:** Patron\n- **Hon'ble Chief Minister Shri Omar Abdullah:** Energy Reviews\n- **Managing Director Shri Pankaj Kumar Sharma, IAS:** Head of Corporate Administration & Operations\n- **Director Finance Shri Ashwani Kumar:** Head of Financial Planning & Accounts\n- **Executive Directors & State Government Nominee Directors.**`,
    },
    {
      url: '/about-us/management/committees',
      title: 'Committee of Directors',
      category: 'About Us',
      keywords: ['committees', 'audit committee', 'project committee', 'board committee'],
      content: `# Committee of Directors\n\nSub-committees of the Board including Audit Committee, Project Clearance Committee, and Corporate Governance Committee.`,
    },
    {
      url: '/about-us/others/awards',
      title: 'Honours & Awards',
      category: 'About Us',
      keywords: ['awards', 'honours', 'recognitions', 'safety awards', 'milestones'],
      content: `# Honours & Awards\n\nRecognitions, safety certificates, and engineering excellence awards conferred on JKSPDCL for Baglihar Stage-I & II and green power development.`,
    },
    {
      url: '/about-us/others/contact',
      title: 'Contact Corporate Offices & Helpline',
      category: 'About Us',
      keywords: ['contact', 'address', 'srinagar office', 'jammu office', 'phone', 'email', 'helpline'],
      content: `# Contact Corporate Offices & Helpline\n\n## Srinagar Corporate Office\n- **Address:** Exhibition Ground, Jahangir Chowk, Srinagar, J&K — 190009\n- **Phone:** +91 194 2451665 | **Email:** md-jkspdcl[at]jk[dot]gov[dot]in\n\n## Jammu Corporate Office\n- **Address:** Ashok Nagar, Satwari, Jammu, J&K — 180004\n- **Phone:** +91 191 2430548 | **Email:** md-jkspdcl[at]jk[dot]gov[dot]in`,
    },

    // ── Our Business & Power Stations ──────────────────────────────────────
    {
      url: '/our-business/power-stations',
      title: 'Operating Power Stations & Hydro Potential',
      category: 'Our Business',
      keywords: ['power stations', 'operating stations', 'bhep', 'baglihar', 'ljhp', 'ushp', 'chep', 'sewa', 'ganderbal', 'karnah', 'pahalgam', 'potentials', 'capacity', '20000 mw', '14867 mw', '1197 mw'],
      content: `# Operating Hydroelectric Power Stations & Hydel Potential\n\n## Hydroelectric Potential in Jammu & Kashmir\n- **Total Identified Potential:** ~20,000 MW across Chenab, Jhelum, Ravi, and Indus river basins.\n- **Economically Viable (CEA Assessed):** 14,867 MW.\n- **JKSPDCL Generation Capacity:** 1,197.40 MW operational across 13 active stations.\n\n## Key Power Stations\n1. **Baglihar Stage-I (450 MW):** Chenab River, Ramban (3x150 MW Francis turbines)\n2. **Baglihar Stage-II (450 MW):** Chenab River, Ramban (3x150 MW Francis turbines) — Total Baglihar Complex = 900 MW\n3. **Lower Jhelum (105 MW):** Jhelum River, Baramulla (3x35 MW Kaplan units)\n4. **Upper Sindh-II (105 MW):** Sindh River, Kangan / Ganderbal (3x35 MW Pelton units)\n5. **Upper Sindh-I (22.60 MW):** Sumbal\n6. **Ganderbal (15 MW):** Ganderbal\n7. **Hanu (10.5 MW):** Hanu\n8. **Chenani-I (9.2 MW):** Udhampur (5 units)\n9. **Sewa-III (9 MW):** Ravi Basin, Kathua\n10. **Pahalgam (3 MW):** Lidder River\n11. **Karnah (2 MW):** Kupwara\n12. **Bhaderwah (1.5 MW):** Doda\n13. **Sanjak (1.26 MW)**\n14. **Historic Mohra Plant (3 MW):** Asia's pioneer hydro station (1905).`,
    },
    {
      url: '/our-business/construction',
      title: 'Projects Under Construction',
      category: 'Our Business',
      keywords: ['construction', 'under construction', 'civil works', 'electromechanical', 'sawalkote', 'kirthai'],
      content: `# Projects Under Construction & Execution\n\nDetails of power projects currently undergoing active civil construction, tunneling, powerhouse excavation, and electromechanical installation across J&K.`,
    },
    {
      url: '/our-business/under-development',
      title: 'Projects Under Development & DPR Appraisal',
      category: 'Our Business',
      keywords: ['under development', 'dpr', 'survey', 'kirthai 1', 'kirthai 2', 'upcoming projects'],
      content: `# Projects Under Development\n\nUpcoming hydroelectric schemes in surveying, Detailed Project Report (DPR) formulation, environment clearance, and bidding stages including Kirthai HEP Stage-I (390 MW) and Kirthai Stage-II (930 MW).`,
    },
    {
      url: '/our-business/jv-subsidiary-projects',
      title: 'Joint Venture & Subsidiary Projects',
      category: 'Our Business',
      keywords: ['joint venture', 'jv', 'cvpppl', 'nhpc', 'pakal dul', 'kiru', 'kwar', 'ratle'],
      content: `# Joint Venture Projects (CVPPPL & RHPCL)\n\nMajor hydroelectric projects executed in Joint Venture with NHPC under Chenab Valley Power Projects Private Limited (CVPPPL):\n- **Pakal Dul HEP:** 1,000 MW (Marusudar River, Kishtwar)\n- **Kiru HEP:** 624 MW (Chenab River, Kishtwar)\n- **Kwar HEP:** 540 MW (Chenab River, Kishtwar)\n- **Ratle HEP:** 850 MW (RHPCL JV with NHPC, Drabshalla, Kishtwar).`,
    },
    {
      url: '/our-business/turnkey',
      title: 'Deposit & Turnkey Projects',
      category: 'Our Business',
      keywords: ['turnkey', 'deposit works', 'government execution'],
      content: `# Deposit & Turnkey Projects\n\nDeposit execution works, substation packages, and transmission works undertaken by JKSPDCL for other government bodies and UT departments.`,
    },
    {
      url: '/our-business/consultancy',
      title: 'Consultancy Services',
      category: 'Our Business',
      keywords: ['consultancy', 'technical services', 'feasibility studies', 'dpr consultancy'],
      content: `# Technical & Engineering Consultancy Services\n\nConsultancy solutions in hydrological studies, dam engineering, rock mechanics, power station design, and commissioning.`,
    },
    {
      url: '/our-business/jv-companies',
      title: 'Joint Venture & Subsidiary Companies',
      category: 'Our Business',
      keywords: ['jv companies', 'subsidiaries', 'cvpppl company', 'rhpcl'],
      content: `# Joint Venture Companies\n\n- **CVPPPL:** Chenab Valley Power Projects [P] Ltd (Joint Venture of JKSPDCL and NHPC Ltd).\n- **Ratle Hydroelectric Power Corporation Limited (RHPCL):** Dedicated JV company for 850 MW Ratle project.`,
    },

    // ── Stakeholders, Vendors & Careers ───────────────────────────────────
    {
      url: '/stakeholders/vendors/tender-bids',
      title: 'Tenders & Bids Portal (e-NIT)',
      category: 'Vendors',
      keywords: ['tenders', 'bids', 'nit', 'enit', 'procurement', 'contracts', 'rfp', 'e-procurement', 'corrigendum'],
      content: `# Tenders & Bids Portal (eNIT Procurement)\n\nOfficial registry of Notice Inviting Tenders (NIT), electronic bids (eNIT), pre-bid updates, corrigenda, and contract awards. Bidders can download tender documents, verify earnest money deposits (EMD), and submit bids via the e-procurement portal.`,
    },
    {
      url: '/stakeholders/vendors/msme-corner',
      title: 'Startups & MSME Corner',
      category: 'Vendors',
      keywords: ['msme', 'startups', 'emd exemption', 'tender fee exemption', 'udyam', 'nsic'],
      content: `# Startups & MSME Corner\n\n- **EMD Exemption:** Registered Micro & Small Enterprises (UDYAM/NSIC) are exempt from submitting Earnest Money Deposit (EMD) in public tenders.\n- **Tender Fee Waiver:** Tender document cost is waived for eligible MSEs.\n- **Purchase Preference:** MSEs receive statutory purchase preferences under Government of India and UT procurement norms.`,
    },
    {
      url: '/stakeholders/career-seekers/current-openings',
      title: 'Current Openings & Careers',
      category: 'Careers',
      keywords: ['careers', 'jobs', 'recruitment', 'current openings', 'vacancies', 'advertisement', 'employment'],
      content: `# Current Openings & Career Opportunities\n\nOfficial employment portal for recruitment advertisements, engineer openings, technician vacancies, notifications, syllabus, and application deadlines at JKSPDCL.`,
    },
    {
      url: '/stakeholders/investors/financial-results',
      title: 'Financial Results & Balance Sheets',
      category: 'Investors',
      keywords: ['financial results', 'balance sheet', 'profit and loss', 'audited accounts', 'financials'],
      content: `# Financial Results & Audited Accounts\n\nAnnual audited financial statements, Balance Sheets, Profit & Loss accounts, and statutory audit reports of JKSPDCL.`,
    },
    {
      url: '/stakeholders/investors/annual-reports',
      title: 'Annual Reports',
      category: 'Investors',
      keywords: ['annual reports', 'progress report', 'corporate report'],
      content: `# Annual Reports Directory\n\nComprehensive annual performance dossiers detailing generation figures, revenue realizations, project progress, and governance records.`,
    },
    {
      url: '/stakeholders/vendors/online-payment',
      title: 'Online Payment Gateway',
      category: 'Vendors',
      keywords: ['online payment', 'pay tender fee', 'emd payment', 'payment gateway'],
      content: `# Online Payment Gateway for Vendors\n\nSecure online payment portal for paying tender fees, document processing charges, and EMD transactions.`,
    },
    {
      url: '/stakeholders/vendors/clpm-portal',
      title: 'Contract Labor Payment Management (CLPM)',
      category: 'Vendors',
      keywords: ['clpm', 'contract labor', 'labor payment', 'wage compliance'],
      content: `# Contract Labor Payment Management (CLPM) Portal\n\nPortal tracking contractor compliance with minimum wages, statutory provident fund (PF), and timely labor disbursements across all power stations.`,
    },

    // ── Commercial Wing ───────────────────────────────────────────────────
    {
      url: '/commercial/overview',
      title: 'Commercial Operations Overview',
      category: 'Commercial',
      keywords: ['commercial overview', 'power purchase', 'ppa', 'trading', 'billing'],
      content: `# Commercial Operations Overview\n\nManagement of power purchase agreements (PPAs), bulk power supply to DISCOMs (KPDCL & JPDCL), energy accounting, and billing settlements.`,
    },
    {
      url: '/commercial/tariff',
      title: 'Commercial Tariff Schedules',
      category: 'Commercial',
      keywords: ['tariff', 'rates', 'power tariff', 'serc tariff', 'cerc tariff', 'per unit rate'],
      content: `# Commercial Tariff Schedules\n\nApproved multi-year tariff orders and power purchase rates approved by the Joint Electricity Regulatory Commission (JERC) and Central Electricity Regulatory Commission (CERC).`,
    },
    {
      url: '/commercial/billing',
      title: 'Power Billing Registry & Joint Meter Readings (JMR)',
      category: 'Commercial',
      keywords: ['billing', 'jmr', 'joint meter reading', 'power bills', 'energy accounting'],
      content: `# Power Billing & JMR Registry\n\nMonthly Joint Meter Readings (JMR) certified with DISCOMs and energy billing registers for all grid-connected power stations.`,
    },

    // ── Sustainability & CSR ──────────────────────────────────────────────
    {
      url: '/sustainability/csr/overview',
      title: 'Corporate Social Responsibility (CSR) Overview',
      category: 'Sustainability',
      keywords: ['csr', 'corporate social responsibility', 'community welfare', '2 percent profit'],
      content: `# Corporate Social Responsibility (CSR) Overview\n\nJKSPDCL allocates 2% of its average net profit towards community welfare, rural education, healthcare, sanitation, and local infrastructure in project catchments.`,
    },
    {
      url: '/sustainability/csr/policy',
      title: 'CSR Policy & Guidelines',
      category: 'Sustainability',
      keywords: ['csr policy', 'csr rules', 'csr spending guidelines'],
      content: `# CSR Policy & Guidelines\n\nOfficial statutory CSR policy framed under Section 135 of the Companies Act 2013 outlining project selection criteria and fund allocations.`,
    },
    {
      url: '/sustainability/environment/preamble',
      title: 'Environmental Preamble & Sustainable Hydel Energy',
      category: 'Sustainability',
      keywords: ['environment', 'preamble', 'catchment area treatment', 'afforestation', 'green energy'],
      content: `# Environmental Commitment & Preamble\n\nCommitment to Run-of-the-River hydro schemes, Catchment Area Treatment (CAT) plans, minimum ecological environmental flows (e-flows), and biodiversity conservation.`,
    },

    // ── Media & Utilities ─────────────────────────────────────────────────
    {
      url: '/notifications',
      title: 'Official Notifications, Orders & Circulars',
      category: 'Media',
      keywords: ['notifications', 'orders', 'circulars', 'office orders', 'latest notices'],
      content: `# Notifications & Circulars\n\nOfficial notices, government orders, transfer postings, seniority lists, and corporate advisories issued by JKSPDCL.`,
    },
    {
      url: '/media/press-releases',
      title: 'Press Releases & News',
      category: 'Media',
      keywords: ['press releases', 'news', 'media statements', 'announcements'],
      content: `# Press Releases & News\n\nOfficial press communications, project milestone announcements, and media updates.`,
    },
    {
      url: '/media/downloads',
      title: 'Downloads Booklet & Publications',
      category: 'Media',
      keywords: ['downloads', 'booklets', 'forms', 'publications', 'documents'],
      content: `# Downloads Booklet & Publications\n\nDownloadable corporate brochures, tenders forms, vendor registration formats, and annual brochures.`,
    },
    {
      url: '/sitemap',
      title: 'Website Sitemap',
      category: 'Utilities',
      keywords: ['sitemap', 'all pages', 'site directory', 'navigation map'],
      content: `# Complete Website Sitemap\n\nComprehensive index of all approved pages and navigation routes on the official JKSPDCL web portal.`,
    },
    {
      url: '/help',
      title: 'Help & Navigation Support',
      category: 'Utilities',
      keywords: ['help', 'support', 'how to search', 'faq', 'guide'],
      content: `# Help & Support\n\nUser guide for searching tenders, downloading PDF documents, and navigating power station portfolios on the JKSPDC portal.`,
    },
    {
      url: '/feedback',
      title: 'Citizen Feedback & Grievance Redressal',
      category: 'Utilities',
      keywords: ['feedback', 'grievance', 'complaints', 'citizen feedback'],
      content: `# Citizen Feedback & Grievance Redressal\n\nOnline feedback submission form and grievance redressal mechanism for public inquiries and complaints.`,
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
