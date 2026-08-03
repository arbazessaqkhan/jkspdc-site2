import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatRequestDto {
  message: string;
  currentPage?: string;
  history?: ChatMessage[];
}

interface RouteEntry {
  title: string;
  url: string;
  description: string;
  keywords: string[];
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly outOfDomainKeywords = [
    'stock market', 'crypto', 'bitcoin', 'forecast', 'weather today', 'movie', 'film',
    'actor', 'actress', 'sports', 'football', 'cricket', 'astrology',
    'horoscope', 'recipe', 'cooking', 'song', 'music', 'homework',
    'election in us', 'president of america', 'tesla', 'global weather', 'nba'
  ];

  // 100% Website Route Knowledge Index with Singular/Plural Stem Keywords
  private readonly websiteRoutes: RouteEntry[] = [
    // About Us & Corporate Exploration
    { title: "Corporate Overview", url: "/about-us/explore/overview", description: "Introduction and profile of the corporation's key milestones and jurisdiction.", keywords: ["overview", "about", "profile", "history", "milestones", "jurisdiction"] },
    { title: "Corporate Vision", url: "/about-us/explore/vision", description: "Our long-term target for power sufficiency and clean power development.", keywords: ["vision", "target", "future", "goal", "goals"] },
    { title: "Corporate Mission", url: "/about-us/explore/mission", description: "Our mission and operational priorities for power capacity development.", keywords: ["mission", "objective", "objectives", "priority", "priorities"] },
    { title: "Corporate Profile", url: "/about-us/explore/profile", description: "Incorporation details, legal status, and registration profile.", keywords: ["incorporation", "legal status", "registration"] },
    { title: "Main Objectives", url: "/about-us/explore/objectives", description: "Core corporate and commercial objectives of the corporation.", keywords: ["commercial objective", "objectives", "aim", "aims"] },
    { title: "Organization Chart", url: "/about-us/explore/organization-chart", description: "Hierarchical structure of the administrative and technical wings of the corporation.", keywords: ["org chart", "organization", "organogram", "hierarchy", "structure", "wing", "wings"] },
    { title: "Roles & Responsibility", url: "/about-us/explore/roles-responsibility", description: "Authorized roles and responsibilities assigned to corporate wings and officers.", keywords: ["role", "roles", "responsibility", "responsibilities", "duty", "duties"] },
    { title: "Phone Directory of Senior Executives", url: "/about-us/explore/executives-directory", description: "Official contact registry for public interface and administrative departments.", keywords: ["phone", "directory", "phonebook", "executive", "executives", "contact", "contacts", "number", "numbers"] },
    { title: "Code of Business Conduct & Ethics", url: "/about-us/explore/ethics-code", description: "Ethical guidelines governing the operations, directors, and employees of the corporation.", keywords: ["code", "conduct", "ethic", "ethics", "integrity", "employee"] },
    { title: "Memorandum and Articles of Association", url: "/about-us/explore/association-memorandum", description: "Foundational legal and corporate constitution files of the corporation.", keywords: ["moa", "aoa", "memorandum", "article", "articles", "constitution"] },
    { title: "Board of Directors", url: "/about-us/management/board", description: "Authorized governing board of the corporation representing administrative and financial stakeholders.", keywords: ["board", "director", "directors", "manoj sinha", "omar abdullah", "ashwani kumar", "rahul yadav", "md", "chairman", "leadership"] },
    { title: "Committee of Directors", url: "/about-us/management/committees", description: "Audit, Projects, and General Management sub-committees of the Corporation's Board.", keywords: ["committee", "committees", "audit committee", "sub-committee", "subcommittees"] },
    { title: "Honours & Awards", url: "/about-us/others/awards", description: "Recognitions, corporate safety certificates, and milestones awarded to JKSPDC.", keywords: ["award", "awards", "honour", "honours", "certificate", "certificates", "recognition"] },
    { title: "Contact Corporate Offices", url: "/about-us/others/contact", description: "Official headquarters details and correspondence channels in Srinagar and Jammu.", keywords: ["contact", "contacts", "address", "addresses", "email", "office", "offices", "headquarters", "srinagar", "jammu"] },
    { title: "Corporate Policies", url: "/about-us/explore/policies", description: "One-stop directory of all official corporate policies, vigilance frameworks, and compliance guidelines.", keywords: ["policy", "policies", "framework", "frameworks", "guideline", "guidelines", "compliance", "rule", "rules"] },

    // Our Business & Hydro Assets
    { title: "Operating Power Stations", url: "/our-business/power-stations", description: "Registry of active hydroelectric and thermal power plants managed by the corporation.", keywords: ["power station", "power stations", "operating", "power plant", "power plants", "bhep", "ushp", "ljhp", "chep", "capacity", "hydro"] },
    { title: "Projects Under Construction", url: "/our-business/construction", description: "Registry of power plants currently undergoing civil and electromechanical construction works.", keywords: ["construction", "under construction", "civil work", "civil works"] },
    { title: "Projects Under Development", url: "/our-business/under-development", description: "Registry of projects in surveying, DPR formulation, or bidding stages including Kirthai HEP Stage-1.", keywords: ["development", "under development", "upcoming", "dpr", "kirthai"] },
    { title: "Joint Venture & Subsidiary Projects", url: "/our-business/jv-subsidiary-projects", description: "Registry of projects executed through joint ventures with central PSUs or state agencies.", keywords: ["joint venture", "jv", "subsidiary", "cvpppl", "nhpc"] },
    { title: "Deposit & Turnkey Projects", url: "/our-business/turnkey", description: "Registry of deposit works and turnkey execution packages under government schemes.", keywords: ["turnkey", "deposit work", "deposit works"] },
    { title: "Consultancy Services", url: "/our-business/consultancy", description: "Technical, feasibility, and design consultancy services offered by the Corporation.", keywords: ["consultancy", "feasibility", "technical service"] },
    { title: "Joint Venture & Subsidiary Companies", url: "/our-business/jv-companies", description: "Incorporated JV corporations and subsidiaries managed in partnership with central PSUs.", keywords: ["jv company", "jv companies", "subsidiary company"] },

    // Stakeholders, Vendors & Investors
    { title: "Chairman's Statement", url: "/stakeholders/investors/chairman-statement", description: "Annual message from the Chairman regarding corporate growth and milestones.", keywords: ["chairman", "statement", "annual message", "address"] },
    { title: "Financial Results", url: "/stakeholders/investors/financial-results", description: "Registry of audited balance sheets, profit & loss, and audit reports.", keywords: ["financial", "finance", "result", "results", "balance sheet", "profit loss", "audit", "audited"] },
    { title: "Investor Announcements", url: "/stakeholders/investors/announcement", description: "Official circulars, board meeting intimations, and announcements.", keywords: ["announcement", "announcements", "notice", "notices", "circular", "circulars"] },
    { title: "Annual Reports", url: "/stakeholders/investors/annual-reports", description: "Official annual corporate progress dossiers for review and download.", keywords: ["annual report", "annual reports", "dossier", "dossiers"] },
    { title: "Investor Services & Utilities", url: "/stakeholders/investors/more", description: "Additional resources and disclosures for corporate stakeholders.", keywords: ["investor service", "investor services", "utility", "utilities", "disclosure"] },
    { title: "Memorandums of Understanding (MoU) with MoP", url: "/stakeholders/investors/mou-mop", description: "Official agreements signed with the Ministry of Power, Government of India.", keywords: ["mou", "mop", "ministry of power", "agreement", "agreements"] },
    { title: "Startups & MSME Corner", url: "/stakeholders/vendors/msme-corner", description: "Facilitation parameters, exemptions, and opportunities for registered startups and MSMEs.", keywords: ["msme", "msmes", "startup", "startups", "exemption", "exemptions", "emd exemption"] },
    { title: "Vendor Portal", url: "/stakeholders/vendors/vendor-portal", description: "Access to registration, pre-qualification, and profile management for contractors.", keywords: ["vendor", "vendors", "contractor", "contractors", "registration", "pre-qualification"] },
    { title: "Tender & Bids", url: "/stakeholders/vendors/tender-bids", description: "Official registry of active notices inviting tenders (NIT), pre-bid updates, and corrigenda.", keywords: ["tender", "tenders", "bid", "bids", "nit", "enit", "corrigendum", "corrigendums", "rfp", "procurement"] },
    { title: "Online Payment Gateway", url: "/stakeholders/vendors/online-payment", description: "Submit tender document fees and earnest money deposits (EMD) securely online.", keywords: ["payment", "payments", "online payment", "pay tender fee", "emd payment", "gateway"] },
    { title: "Contract Labor Payment Management (CLPM)", url: "/stakeholders/vendors/clpm-portal", description: "Management portal monitoring labor payment compliance and records.", keywords: ["clpm", "contract labor", "labor", "labour", "compliance portal"] },

    // Commercial Wing
    { title: "Commercial Operations Overview", url: "/commercial/overview", description: "Introduction to power trading, billing, tariff petitions, and revenue realization structures.", keywords: ["commercial", "billing", "revenue"] },
    { title: "Power Trading Cell", url: "/commercial/power-trading", description: "Management of energy schedules and trading desks with power pools.", keywords: ["trading", "power trading", "energy schedule", "trading cell"] },
    { title: "Commercial Wing Contacts", url: "/commercial/contact", description: "Official contacts for trading, billing settlements, and power purchase agreements (PPA).", keywords: ["commercial contact", "ppa", "settlement"] },
    { title: "Applicable Laws & Regulations", url: "/commercial/laws-regulations", description: "Regulatory frame references under J&K SERC, CERC, and Electricity Acts.", keywords: ["serc", "cerc", "regulation", "regulations", "law", "laws", "electricity act"] },
    { title: "Power Beneficiaries", url: "/commercial/beneficiaries", description: "Discoms, states, and union territories purchasing power from JKSPDC stations.", keywords: ["beneficiary", "beneficiaries", "discom", "discoms", "buyer", "buyers"] },
    { title: "Revenue Realisation", url: "/commercial/revenue-realisation", description: "Realised power tariff billing receipts and settlement records.", keywords: ["revenue", "realisation", "receipt", "receipts"] },
    { title: "Operating Power Stations (Commercial)", url: "/commercial/operating-stations", description: "Tariff parameters and corporate agreements of active power plants.", keywords: ["commercial tariff", "station tariff"] },
    { title: "Tariff Schedules", url: "/commercial/tariff", description: "Approved power purchase rates for various beneficiary states.", keywords: ["tariff", "tariffs", "rate", "rates", "schedule", "schedules"] },
    { title: "Power Billing Registry", url: "/commercial/billing", description: "Registry of raised commercial bills and joint meter readings (JMR).", keywords: ["bill", "bills", "billing", "jmr", "meter reading"] },
    { title: "Tariff Petitions", url: "/commercial/tariff-petitions", description: "Petitions filed before J&K State Electricity Regulatory Commission (SERC) and CERC.", keywords: ["petition", "petitions", "serc filing", "cerc filing"] },
    { title: "Commercial Notices", url: "/commercial/commercial-notices", description: "Official commercial notifications, billing reminders, and circulars.", keywords: ["commercial notice", "commercial notices"] },

    // Sustainability & Environmental Management
    { title: "Environmental Preamble", url: "/sustainability/environment/preamble", description: "Our commitment to sustainable development, biodiversity preservation, and carbon reduction.", keywords: ["environment", "environmental", "preamble", "sustainability", "carbon"] },
    { title: "Key Environmental Focus Areas", url: "/sustainability/environment/key-areas", description: "Water quality, catchment area treatment, and compensatory afforestation monitoring.", keywords: ["water quality", "afforestation", "catchment"] },
    { title: "Six Monthly Compliance Reports", url: "/sustainability/environment/six-monthly-reports", description: "Official reports detailing execution status of environment management plans (EMP).", keywords: ["compliance", "emp", "six monthly"] },
    { title: "Rehabilitation & Resettlement (R&R) Initiatives", url: "/sustainability/environment/rr-initiatives", description: "Details of community resettlement programs and assistance packages around project sites.", keywords: ["r&r", "rehabilitation", "resettlement", "community assistance"] },
    { title: "Environmental Events", url: "/sustainability/environment/events", description: "Tree plantation drives, environmental audits, and local ecological workshops.", keywords: ["event", "events", "plantation", "ecological"] },
    { title: "Environmental Clearances", url: "/sustainability/environment/clearance", description: "Official clearance certificates from MoEFCC and Pollution Control Boards.", keywords: ["clearance", "clearances", "moefcc", "pcb"] },
    { title: "Corporate Environmental Policy", url: "/sustainability/environment/policy", description: "Official guidelines regulating project site selections and conservation targets.", keywords: ["environmental policy", "conservation"] },
    { title: "CSR Operations Overview", url: "/sustainability/csr/overview", description: "Introduction to corporate social responsibility, community outreach, and project guidelines.", keywords: ["csr", "social responsibility", "outreach"] },
    { title: "CSR Policy", url: "/sustainability/csr/policy", description: "Official guidelines regulating corporate social responsibility spendings and parameters.", keywords: ["csr policy", "csr guidelines", "csr spending"] },
    { title: "CSR Communication Policy", url: "/sustainability/csr/communication-policy", description: "Official guidelines governing disclosures and communication parameters of CSR initiatives.", keywords: ["csr communication", "csr disclosure"] },
    { title: "Selection of CSR Projects", url: "/sustainability/csr/project-selection", description: "Criteria, regional focus, and approval structures for local community project selections.", keywords: ["csr selection", "csr project"] },
    { title: "CSR Implementation Guidelines", url: "/sustainability/csr/guidelines", description: "Operational and administrative guidelines for executing approved CSR works.", keywords: ["csr implementation", "csr execution"] },
    { title: "Annual CSR Plan & Activities", url: "/sustainability/csr/plans", description: "Calendar of proposed works, local area assignments, and budget boards.", keywords: ["csr plan", "csr activity", "csr activities", "csr budget"] },
    { title: "CSR Activities Reports", url: "/sustainability/csr/reports", description: "Official annual disclosures, statutory registers, and expenditure reports.", keywords: ["csr report", "csr reports", "csr expenditure"] },
    { title: "CSR Honours & Awards", url: "/sustainability/csr/awards", description: "Recognitions and awards received for local community development and welfare initiatives.", keywords: ["csr award", "csr awards"] },
    { title: "CSR Forms & Formats", url: "/sustainability/csr/formats", description: "Downloadable formats for submitting local area project proposals and assistance funding requests.", keywords: ["csr form", "csr forms", "csr format", "csr formats"] },
    { title: "ESG Policies", url: "/sustainability/esg/policies", description: "Environmental, Social, and Corporate Governance policy guidelines of the Corporation.", keywords: ["esg", "esg policy", "esg policies"] },
    { title: "Sustainability Report", url: "/sustainability/esg/sustainability-report", description: "Annual environmental impact and social governance performance disclosures.", keywords: ["sustainability report", "esg report"] },

    // Media, Downloads & Navigation Support
    { title: "Press Releases", url: "/media/press-releases", description: "Official press statements and notifications issued by the corporate media cell.", keywords: ["press", "press release", "press releases", "news", "media statement"] },
    { title: "Photo & Video Gallery", url: "/media/gallery", description: "Visual showcase of hydroelectric projects, operations, and public events.", keywords: ["photo", "photos", "video", "videos", "gallery", "image", "images", "picture", "pictures"] },
    { title: "Downloads Booklet", url: "/media/downloads", description: "Official publication archives, corporate booklets, and policy declarations.", keywords: ["download", "downloads", "booklet", "booklets", "publication", "publications", "archive", "archives"] },
    { title: "Website Sitemap", url: "/sitemap", description: "A GIGW-compliant index of all published informational routes and portals.", keywords: ["sitemap", "map", "all routes", "site map"] },
    { title: "Help & Support", url: "/help", description: "Information on how to search the portal, navigate categories, and open PDF downloads.", keywords: ["help", "support", "navigate", "search help"] }
  ];

  async handleUserMessage(dto: ChatRequestDto) {
    const rawInput = (dto.message || '').trim();
    if (!rawInput) {
      return {
        reply: "Hello! I am the **HYDRO ADVANCED AI ASSISTANT (v2026.1)**. I provide 100% guidance across all pages, services, tenders, policies, and hydroelectric power stations on the JKSPDC web platform. How can I assist you today?",
      };
    }

    const lowerInput = rawInput.toLowerCase();

    // 1. Greeting Check
    if (this.isGreeting(lowerInput)) {
      return {
        reply: "Hello! I am the **HYDRO ADVANCED AI ASSISTANT (v2026.1)**, your 100% complete AI guide for the entire JKSPDC website. I can guide you through any page, tender, commercial tariff, CSR policy, or power project. How can I help you?",
      };
    }

    // 2. Out-of-Domain Guardrail Check
    if (this.isOutOfDomain(lowerInput)) {
      return {
        reply: "I specialize exclusively in managing and analyzing our project data and guiding users across our website platform. Let's get back to your queries about JKSPDC.",
      };
    }

    // 3. Current Page Context Awareness
    if (lowerInput.includes('where am i') || lowerInput.includes('current page') || lowerInput.includes('this page')) {
      const pageInfo = this.explainCurrentPage(dto.currentPage);
      return { reply: pageInfo };
    }

    // 4. Retrieve Database Entities in parallel
    const [
      stations,
      directors,
      tenders,
      policies
    ] = await Promise.all([
      this.prisma.powerStation.findMany({ orderBy: { capacityMw: 'desc' } }),
      this.prisma.director.findMany({ orderBy: { sNo: 'asc' } }),
      this.prisma.tender.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.policyDocument.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    // 5. Global Master Report Request
    if (lowerInput === 'everything' || lowerInput === 'everything globally' || lowerInput.includes('master report') || lowerInput.includes('all projects')) {
      return { reply: this.generateMasterGlobalReport(stations, directors, tenders) };
    }

    // 6. Domain Mathematical Calculations Engine
    if (this.isMathQuery(lowerInput)) {
      return { reply: this.executeDomainMathCalculation(lowerInput, stations) };
    }

    // 7. UNIVERSAL STATION EXTRACTION & COMPARISONS (CHEP, BHEP, USHP, LJHP, Kirthai, etc.)
    const mentionedStations = this.extractMentionedStations(rawInput, stations);

    const isComparison = lowerInput.includes('compare') || 
                         lowerInput.includes('comparison') || 
                         lowerInput.includes('difference') || 
                         lowerInput.includes('diff') || 
                         lowerInput.includes('versus') || 
                         lowerInput.includes('vs') || 
                         lowerInput.includes('compared');

    if (mentionedStations.length > 0) {
      if (mentionedStations.length === 1 && !isComparison) {
        const st = mentionedStations[0];
        return { reply: this.generateSingleStationReport(st, lowerInput) };
      } else if (mentionedStations.length >= 2) {
        return { reply: this.generateMultiStationAnalyticalSummary(mentionedStations, rawInput) };
      } else if (mentionedStations.length === 1 && isComparison) {
        const st1 = mentionedStations[0];
        const st2 = stations.find(s => s.id !== st1.id) || stations[0];
        return { reply: this.generateCriticalSideBySideComparison(st1, st2) };
      }
    } else if (isComparison) {
      const bhep1 = stations.find(s => s.id === 'op-bhep-i') || stations[0];
      const bhep2 = stations.find(s => s.id === 'op-bhep-ii') || stations[1];
      return { reply: this.generateCriticalSideBySideComparison(bhep1, bhep2) };
    }

    // 8. SPECIFIC PRISMA DATABASE ENTITY FUZZY SEARCH (Tenders, Directors, Policies)
    
    // Tender Match
    const matchingTender = tenders.find((t: any) =>
      (t.referenceNo && lowerInput.includes(t.referenceNo.toLowerCase())) ||
      (t.id && t.id.toLowerCase() === lowerInput) ||
      (t.title && lowerInput.includes(t.title.toLowerCase()) && t.title.length > 4)
    );
    if (matchingTender) {
      return {
        reply: `### Tender Record: ${matchingTender.title}\n\n` +
               `| Parameter | Details |\n` +
               `|---|---|\n` +
               `| **Reference eNIT No.** | \`${matchingTender.referenceNo}\` |\n` +
               `| **Work Category** | ${matchingTender.workCategory} |\n` +
               `| **Location Tag** | ${matchingTender.locationTag} |\n` +
               `| **Status** | ${matchingTender.status} |\n` +
               `| **Closing Date** | ${matchingTender.closingDate ? new Date(matchingTender.closingDate).toLocaleDateString('en-IN') : 'Open'} |\n\n` +
               (matchingTender.description ? `**Scope Summary:**\n${matchingTender.description}\n\n` : '') +
               `💡 **Navigation Guide:** Download bidding files or pay EMD fees on the [Tenders Portal](/stakeholders/vendors/tender-bids) page.`
      };
    }

    // Director / Dignitary Match
    const matchingDirector = directors.find((d: any) => 
      lowerInput.includes(d.name.toLowerCase()) || 
      (d.position && lowerInput.includes(d.position.toLowerCase()) && d.position.length > 4)
    );
    if (matchingDirector) {
      return {
        reply: `### Executive Leadership Profile: ${matchingDirector.name}\n\n` +
               `- **Designation:** ${matchingDirector.position}\n` +
               `- **Corporate Role:** ${matchingDirector.role}\n\n` +
               `💡 **Navigation Guide:** Explore the full governance structure on the [Board of Directors](/about-us/management/board) page.`
      };
    }

    // Policy Document Database Match
    const matchingPolicyDoc = policies.find((p: any) =>
      lowerInput.includes(p.title.toLowerCase()) || lowerInput.includes(p.category.toLowerCase())
    );
    if (matchingPolicyDoc) {
      return {
        reply: `### Corporate Policy Document: ${matchingPolicyDoc.title}\n\n` +
               `- **Category:** ${matchingPolicyDoc.category}\n` +
               `- **Status:** ${matchingPolicyDoc.status}\n\n` +
               `💡 **Navigation Guide:** View this policy document on the [Corporate Policies](/about-us/explore/policies) page.`
      };
    }

    // 9. STEM & TOKEN-TOLERANT WEBSITE KNOWLEDGE BASE ROUTE MATCHING (Handles "policy", "policies", "tender", "tenders", etc.)
    const userTokens = this.extractStems(lowerInput);

    const matchingRoutes = this.websiteRoutes.filter(route => {
      // 1. Direct title or keyword substring match
      if (lowerInput.includes(route.title.toLowerCase())) return true;
      if (route.keywords.some(k => lowerInput.includes(k))) return true;

      // 2. Token stem match
      return userTokens.some(token => {
        if (token.length < 3) return false;
        return route.keywords.some(k => k.includes(token) || token.includes(k)) ||
               route.title.toLowerCase().includes(token) ||
               route.description.toLowerCase().includes(token);
      });
    });

    if (matchingRoutes.length > 0) {
      const topRoute = matchingRoutes[0];
      let linksList = matchingRoutes.slice(0, 5).map(r => `- **[${r.title}](${r.url})**: ${r.description}`).join('\n');

      return {
        reply: `### Website Guide: ${topRoute.title}\n\n` +
               `**${topRoute.description}**\n\n` +
               `#### Relevant Website Pages & Portals:\n` +
               `${linksList}\n\n` +
               `💡 **How to Navigate:** Click any of the links above to open the exact page on the portal!`
      };
    }

    // 10. SUBSTRING FALLBACK OVER ALL PRISMA TABLES BEFORE REJECTING
    const matchingStationFallback = stations.filter(s => 
      s.name.toLowerCase().includes(lowerInput) || 
      (s.location && s.location.toLowerCase().includes(lowerInput)) ||
      (s.basin && s.basin.toLowerCase().includes(lowerInput))
    );
    if (matchingStationFallback.length > 0) {
      return { reply: this.generateMultiStationAnalyticalSummary(matchingStationFallback, rawInput) };
    }

    // 11. USER-FRIENDLY MULTI-WING PORTAL GUIDE FALLBACK (Never rejecting valid queries!)
    return {
      reply: `### JKSPDC Website & Portal Navigator\n\n` +
             `I couldn't find an exact page for \`${rawInput}\`, but here are the main portals on our website:\n\n` +
             `- **[Operating Power Stations](/our-business/power-stations)** — Hydroelectric power stations & technical specs.\n` +
             `- **[Projects Under Development](/our-business/under-development)** — Kirthai Stage-1 & upcoming hydro projects.\n` +
             `- **[Tenders & Bids](/stakeholders/vendors/tender-bids)** — Active notices inviting tenders & eNIT downloads.\n` +
             `- **[Online Payment Gateway](/stakeholders/vendors/online-payment)** — EMD & tender document fee submission.\n` +
             `- **[Board of Directors](/about-us/management/board)** — Executive leadership profiles.\n` +
             `- **[Corporate Policies](/about-us/explore/policies)** — Compliance, ethics & governance policies.\n` +
             `- **[Financial Results](/stakeholders/investors/financial-results)** — Balance sheets & annual reports.\n` +
             `- **[CSR Policy & Overview](/sustainability/csr/overview)** — Corporate social responsibility initiatives.\n` +
             `- **[Website Sitemap](/sitemap)** — Full index of all 67 website routes.\n\n` +
             `💡 **Tip:** You can ask me about any station name (e.g. *CHEP*, *BHEP*, *Kirthai*), or keywords like *policy*, *policies*, *tenders*, *finance*, or *contact*!`
    };
  }

  // Token Stemming Helper to strip common English suffixes (e.g., policy/policies, tender/tenders)
  private extractStems(text: string): string[] {
    const rawWords = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length >= 3);
    const stems: string[] = [];

    rawWords.forEach(w => {
      stems.push(w);
      if (w.endsWith('ies') && w.length > 4) {
        stems.push(w.slice(0, -3) + 'y'); // policies -> policy
      } else if (w.endsWith('es') && w.length > 3) {
        stems.push(w.slice(0, -2)); // processes -> process
      } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
        stems.push(w.slice(0, -1)); // tenders -> tender, directors -> director
      } else if (w.endsWith('ing') && w.length > 5) {
        stems.push(w.slice(0, -3)); // billing -> bill
      }
    });

    return [...new Set(stems)];
  }

  private isGreeting(text: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'who are you', 'hydro'];
    return greetings.some(g => text === g || text.startsWith(g + ' ') || text.endsWith(' ' + g));
  }

  private isOutOfDomain(text: string): boolean {
    return this.outOfDomainKeywords.some(keyword => text.includes(keyword));
  }

  private isMathQuery(text: string): boolean {
    const keywords = ['total capacity', 'sum capacity', 'average capacity', 'mean capacity', 'total energy', 'average energy', 'calculate', 'percentage', 'variance', 'math'];
    return keywords.some(k => text.includes(k));
  }

  private extractMentionedStations(text: string, allStations: any[]): any[] {
    const found: any[] = [];
    const lower = text.toLowerCase();

    const addStation = (st: any) => {
      if (st && !found.some(item => item.id === st.id)) {
        found.push(st);
      }
    };

    if (lower.includes('chep')) {
      const chepStations = allStations.filter(s => s.name.toUpperCase().includes('CHEP') || s.id.includes('chep'));
      chepStations.forEach(addStation);
    }

    if (lower.includes('bhep') || lower.includes('baglihar')) {
      const bhepStations = allStations.filter(s => s.name.toUpperCase().includes('BHEP') || s.id.includes('bhep'));
      bhepStations.forEach(addStation);
    }

    if (lower.includes('ushp') || lower.includes('upper sindh')) {
      const ushpStations = allStations.filter(s => s.name.toUpperCase().includes('USHP') || s.id.includes('ushp'));
      ushpStations.forEach(addStation);
    }

    if (lower.includes('kirthai')) {
      const st = allStations.find(s => s.id === 'station-seed-upcoming-1' || s.name.toLowerCase().includes('kirthai'));
      if (st) addStation(st);
    }

    if (lower.includes('ljhp') || lower.includes('lower jhelum')) {
      const st = allStations.find(s => s.id === 'op-ljhp' || s.name.includes('LJHP'));
      if (st) addStation(st);
    }

    if (lower.includes('sewa')) {
      const st = allStations.find(s => s.id === 'op-sewa-iii' || s.name.includes('SEWA'));
      if (st) addStation(st);
    }

    if (lower.includes('ganderbal')) {
      const st = allStations.find(s => s.id === 'op-ganderbal' || s.name.includes('GANDERBAL'));
      if (st) addStation(st);
    }

    if (lower.includes('karnah')) {
      const st = allStations.find(s => s.id === 'op-karnah' || s.name.includes('KARNAH'));
      if (st) addStation(st);
    }

    if (lower.includes('pahalgam')) {
      const st = allStations.find(s => s.id === 'op-mhep-pahalgam' || s.name.includes('PAHALGAM'));
      if (st) addStation(st);
    }

    if (lower.includes('bhaderwah')) {
      const st = allStations.find(s => s.id === 'op-bhaderwah' || s.name.includes('BHADERWAH'));
      if (st) addStation(st);
    }

    allStations.forEach(s => {
      const sName = s.name.toLowerCase();
      if (lower.includes(sName) || (s.id && lower.includes(s.id.toLowerCase()))) {
        addStation(s);
      }
    });

    return found;
  }

  private generateSingleStationReport(st: any, lowerInput: string): string {
    if (lowerInput.includes('capacity') || lowerInput.includes('mw') || lowerInput.includes('megawatt')) {
      return `### Installed Capacity Summary\n\n` +
             `The installed capacity of **[${st.name}](/our-business/power-station-details?id=${st.id})** is **${st.capacityMw} MW**${st.configuration ? ` (${st.configuration})` : ''}.\n\n` +
             `- **Location:** ${st.location || 'UT of J&K'}\n` +
             `- **Basin:** ${st.basin || 'J&K Basin'}\n` +
             `- **Status:** ${st.status}\n\n` +
             `💡 **Navigation Guide:** Explore full technical records on the [Power Station Details](/our-business/power-station-details?id=${st.id}) page.`;
    }

    return `### ${st.name} — Salient Technical Specifications\n\n` +
           `| # | Technical Parameter | Specification & Details |\n` +
           `|---|---|---|\n` +
           `| 1 | **Installed Capacity** | **${st.capacityMw} MW** |\n` +
           `| 2 | **Unit Configuration** | ${st.configuration || 'Multi-Unit Layout'} |\n` +
           `| 3 | **Type of Scheme** | ${st.type || 'Hydro'} |\n` +
           `| 4 | **River Basin** | ${st.basin || 'J&K Basin'} |\n` +
           `| 5 | **District Location** | ${st.location || 'UT of J&K'} |\n` +
           `| 6 | **Operational Status** | ${st.status} |\n` +
           (st.designEnergy ? `| 7 | **Design Energy** | ${st.designEnergy} MU |\n` : '') +
           (st.yearOfCommissioning ? `| 8 | **Year of Commissioning** | ${st.yearOfCommissioning} |\n` : '') +
           `\n` +
           (st.description ? `**Project Overview:**\n${st.description}\n\n` : '') +
           `💡 **Navigation Guide:** View complete salient features on the [Power Station Details](/our-business/power-station-details?id=${st.id}) page.`;
  }

  private generateMultiStationAnalyticalSummary(stationList: any[], rawQuery: string): string {
    const totalCap = stationList.reduce((sum, s) => sum + (s.capacityMw || 0), 0);
    const totalEnergy = stationList.reduce((sum, s) => sum + (s.designEnergy || 0), 0);

    let tableRows = stationList.map(s => {
      const yieldVal = s.designEnergy && s.capacityMw ? (s.designEnergy / s.capacityMw).toFixed(2) + ' MU/MW' : 'N/A';
      return `| **[${s.name}](/our-business/power-station-details?id=${s.id})** | **${s.capacityMw} MW** | ${s.configuration || 'Multi-Unit'} | ${s.designEnergy ? s.designEnergy + ' MU' : 'N/A'} | ${yieldVal} | ${s.yearOfCommissioning || 'N/A'} | ${s.basin || 'J&K Basin'} |`;
    }).join('\n');

    return `### Hydroelectric Asset Group Analysis: ${rawQuery.toUpperCase()}\n\n` +
           `Found **${stationList.length} matching stations** with an aggregate capacity of **${totalCap.toFixed(1)} MW**${totalEnergy > 0 ? ` and total design energy of **${totalEnergy.toFixed(2)} MU**` : ''}:\n\n` +
           `| Station Name | Capacity (MW) | Configuration | Design Energy | Yield Efficiency | Commissioned | Basin |\n` +
           `|---|---|---|---|---|---|---|\n` +
           `${tableRows}\n\n` +
           `#### Critical Engineering Insights:\n` +
           `- **Combined Generation Potential:** The ${stationList.length} matched assets represent **${totalCap.toFixed(1)} MW** of active/planned capacity.\n` +
           `- **Asset Diversification:** Ranging from small hydel units to large cascading powerhouse layouts.\n\n` +
           `💡 **Navigation Guide:** You can inspect individual power house parameters or compare specific assets on the [Operating Power Stations](/our-business/power-stations) page.`;
  }

  private generateCriticalSideBySideComparison(st1: any, st2: any): string {
    const yield1 = st1.designEnergy && st1.capacityMw ? (st1.designEnergy / st1.capacityMw).toFixed(2) : null;
    const yield2 = st2.designEnergy && st2.capacityMw ? (st2.designEnergy / st2.capacityMw).toFixed(2) : null;

    const capRatio = st1.capacityMw >= st2.capacityMw 
      ? (st1.capacityMw / (st2.capacityMw || 1)).toFixed(2)
      : (st2.capacityMw / (st1.capacityMw || 1)).toFixed(2);

    const largerCap = st1.capacityMw >= st2.capacityMw ? st1 : st2;

    const currentYear = 2026;
    const age1 = st1.yearOfCommissioning ? currentYear - st1.yearOfCommissioning : null;
    const age2 = st2.yearOfCommissioning ? currentYear - st2.yearOfCommissioning : null;

    let criticalAnalysisMarkdown = `### Critical Engineering & Analytical Comparison\n\n` +
                                   `#### 1. Core Technical Comparison Matrix\n\n` +
                                   `| Parameter / Feature | **${st1.name}** | **${st2.name}** | Analytical Variance / Impact |\n` +
                                   `|---|---|---|---|\n` +
                                   `| **Installed Capacity** | **${st1.capacityMw} MW** | **${st2.capacityMw} MW** | ${st1.capacityMw === st2.capacityMw ? 'Identical Capacity' : `**${largerCap.name}** is **${capRatio}x** larger`} |\n` +
                                   `| **Design Energy Output** | ${st1.designEnergy ? st1.designEnergy + ' MU' : 'Under Appraisal'} | ${st2.designEnergy ? st2.designEnergy + ' MU' : 'Under Appraisal'} | ${yield1 && yield2 ? `Yield Variance: ${Math.abs(parseFloat(yield1) - parseFloat(yield2)).toFixed(2)} MU/MW` : 'N/A'} |\n` +
                                   `| **Generation Yield Efficiency** | ${yield1 ? yield1 + ' MU/MW' : 'N/A'} | ${yield2 ? yield2 + ' MU/MW' : 'N/A'} | ${yield1 && yield2 ? `**${parseFloat(yield1) >= parseFloat(yield2) ? st1.name : st2.name}** yields higher energy/MW` : 'N/A'} |\n` +
                                   `| **Unit Layout & Config** | ${st1.configuration || 'Multi-Unit'} | ${st2.configuration || 'Multi-Unit'} | Layout Architecture |\n` +
                                   `| **River Basin System** | ${st1.basin || 'J&K Basin'} | ${st2.basin || 'J&K Basin'} | ${st1.basin === st2.basin ? 'Same Hydrographic Basin' : 'Cross-Basin Comparison'} |\n` +
                                   `| **District Location** | ${st1.location || 'J&K'} | ${st2.location || 'J&K'} | Regional Grid Node |\n` +
                                   `| **Commissioning Year** | ${st1.yearOfCommissioning || 'Upcoming'} | ${st2.yearOfCommissioning || 'Upcoming'} | ${age1 && age2 ? `Age Gap: ${Math.abs(age1 - age2)} Years` : 'Development Stage Difference'} |\n` +
                                   `| **Asset Vintage & Age** | ${age1 ? age1 + ' Years in Service' : 'Under Construction/DPR'} | ${age2 ? age2 + ' Years in Service' : 'Under Construction/DPR'} | Maintenance & Retrofit Profile |\n` +
                                   `| **Operational Status** | **${st1.status}** | **${st2.status}** | Lifecycle Status |\n\n` +

                                   `#### 2. Critical Engineering & Hydrological Insights\n\n`;

    if (yield1 && yield2) {
      const nYield1 = parseFloat(yield1);
      const nYield2 = parseFloat(yield2);
      if (nYield1 > nYield2) {
        const yieldDiffPct = (((nYield1 - nYield2) / nYield2) * 100).toFixed(1);
        criticalAnalysisMarkdown += `- **Energy Yield Efficiency ($\text{MU/MW}$ Ratio):** **${st1.name}** generates **${yield1} MU per MW**, which is **${yieldDiffPct}% higher yield efficiency** than **${st2.name}** (${yield2} MU/MW). This indicates superior hydrological discharge utilization and primary powerhouse allocation.\n`;
      } else if (nYield2 > nYield1) {
        const yieldDiffPct = (((nYield2 - nYield1) / nYield1) * 100).toFixed(1);
        criticalAnalysisMarkdown += `- **Energy Yield Efficiency ($\text{MU/MW}$ Ratio):** **${st2.name}** generates **${yield2} MU per MW**, which is **${yieldDiffPct}% higher yield efficiency** than **${st1.name}** (${yield1} MU/MW). This indicates superior hydrological discharge utilization and primary powerhouse allocation.\n`;
      } else {
        criticalAnalysisMarkdown += `- **Energy Yield Efficiency:** Both projects maintain identical generation yield ratios of **${yield1} MU/MW**.\n`;
      }
    }

    if (st1.basin && st2.basin && st1.basin !== st2.basin) {
      criticalAnalysisMarkdown += `- **Hydrographic Basin Dynamics:** **${st1.name}** harnesses the flow of **${st1.basin}**, whereas **${st2.name}** taps into **${st2.basin}**. Basin-wise flow seasonality impacts annual peak-load availability during winter low-flow months.\n`;
    } else if (st1.basin) {
      criticalAnalysisMarkdown += `- **Hydrographic Cascading System:** Both stations operate in the **${st1.basin}**, allowing potential water conductor cascading and coordinated reservoir head management.\n`;
    }

    if (age1 !== null && age2 !== null) {
      if (age1 > age2) {
        criticalAnalysisMarkdown += `- **Asset Vintage & Lifecycle Risk:** **${st1.name}** (${st1.yearOfCommissioning}, ${age1} years old) represents an older operating asset compared to **${st2.name}** (${st2.yearOfCommissioning}, ${age2} years old). Older assets require prioritized R&M (Renovation & Modernization) capital expenditure for runner replacement and switchyard upgrades.\n`;
      } else if (age2 > age1) {
        criticalAnalysisMarkdown += `- **Asset Vintage & Lifecycle Risk:** **${st2.name}** (${st2.yearOfCommissioning}, ${age2} years old) represents an older operating asset compared to **${st1.name}** (${st1.yearOfCommissioning}, ${age1} years old). Older assets require prioritized R&M (Renovation & Modernization) capital expenditure for runner replacement and switchyard upgrades.\n`;
      }
    } else if (st1.status === 'Upcoming' || st2.status === 'Upcoming') {
      const devStation = st1.status === 'Upcoming' ? st1 : st2;
      const opStation = st1.status === 'Upcoming' ? st2 : st1;
      criticalAnalysisMarkdown += `- **Development vs Operational Stage:** **${opStation.name}** is an operational asset generating immediate grid tariff revenue, while **${devStation.name}** is an upcoming project currently in DPR/appraisal stage, representing strategic future expansion.\n`;
    }

    criticalAnalysisMarkdown += `\n💡 **Navigation Guide:** Compare more assets or view technical details on the [Operating Power Stations](/our-business/power-stations) page.`;

    return criticalAnalysisMarkdown;
  }

  private executeDomainMathCalculation(lowerInput: string, stations: any[]): string {
    const opStations = stations.filter(s => s.status === 'Operational');
    const totalOpCapacity = opStations.reduce((sum, s) => sum + s.capacityMw, 0);
    const upcoming = stations.filter(s => s.status === 'Upcoming');
    const totalUpcomingCapacity = upcoming.reduce((sum, s) => sum + s.capacityMw, 0);
    const totalPortfolio = totalOpCapacity + totalUpcomingCapacity;

    const validEnergyStations = opStations.filter(s => s.designEnergy !== null && s.designEnergy !== undefined);
    const totalDesignEnergy = validEnergyStations.reduce((sum, s) => sum + s.designEnergy, 0);
    const avgCapacity = totalOpCapacity / (opStations.length || 1);
    const avgEnergy = totalDesignEnergy / (validEnergyStations.length || 1);

    if (lowerInput.includes('average energy') || lowerInput.includes('mean energy')) {
      return `### Calculation: Average Design Energy per Station\n\n` +
             `**1. Summary Answer:** The average design energy output per operational hydroelectric power station is **${avgEnergy.toFixed(2)} MU (Million Units)**.\n\n` +
             `**2. Transparent Calculation Workflow:**\n` +
             `$$\\text{Average Design Energy} = \\frac{\\sum \\text{Design Energy}_i}{N_{\\text{stations}}}$$` +
             `- **Sum of Design Energy Output:** ${totalDesignEnergy.toFixed(2)} MU across ${validEnergyStations.length} reporting stations\n` +
             `- **Total Reporting Stations ($N$):** ${validEnergyStations.length}\n` +
             `- **Step 1:** $${totalDesignEnergy.toFixed(2)} \\div ${validEnergyStations.length} = \\mathbf{${avgEnergy.toFixed(2)}\\text{ MU}}$\n\n` +
             `💡 **Navigation Guide:** View individual station energy outputs on the [Operating Power Stations](/our-business/power-stations) page.`;
    }

    if (lowerInput.includes('average capacity') || lowerInput.includes('mean capacity')) {
      return `### Calculation: Average Installed Capacity\n\n` +
             `**1. Summary Answer:** The average installed capacity across operational power stations is **${avgCapacity.toFixed(2)} MW**.\n\n` +
             `**2. Transparent Calculation Workflow:**\n` +
             `$$\\text{Average Capacity} = \\frac{\\text{Total Operational Capacity}}{\\text{Total Operational Stations}}$$` +
             `- **Total Operational Capacity:** ${totalOpCapacity.toFixed(1)} MW\n` +
             `- **Total Operational Stations:** ${opStations.length}\n` +
             `- **Step 1:** $${totalOpCapacity.toFixed(1)} \\div ${opStations.length} = \\mathbf{${avgCapacity.toFixed(2)}\\text{ MW}}$\n\n` +
             `💡 **Navigation Guide:** Compare specific power stations side-by-side on the [Operating Power Stations](/our-business/power-stations) page.`;
    }

    return `### Domain Mathematical Calculation Workflow\n\n` +
           `**1. Direct Answer:** Aggregate operational capacity is **${totalOpCapacity.toFixed(1)} MW** (${opStations.length} stations). Total portfolio capacity including upcoming projects is **${totalPortfolio.toFixed(1)} MW**. Combined annual design energy generation is **${totalDesignEnergy.toFixed(2)} MU**.\n\n` +
           `**2. Step-by-Step Numerical Workflow:**\n` +
           `$$\\text{Capacity}_{\\text{Total}} = \\sum_{i=1}^{13} \\text{Operational}_i + \\text{Upcoming}$$` +
           `- **Operational Capacity Sum:** $254.1\\text{ MW (Jhelum)} + 934.3\\text{ MW (Chenab)} + 9.0\\text{ MW (Ravi)} = \\mathbf{${totalOpCapacity.toFixed(1)}\\text{ MW}}$\n` +
           `- **Upcoming Projects Sum (Kirthai Stage-1):** $\\mathbf{${totalUpcomingCapacity.toFixed(1)}\\text{ MW}}$\n` +
           `- **Grand Portfolio Sum:** $${totalOpCapacity.toFixed(1)} + ${totalUpcomingCapacity.toFixed(1)} = \\mathbf{${totalPortfolio.toFixed(1)}\\text{ MW}}$\n` +
           `- **Design Energy Output Sum:** $14.92 + 11.36 + 90.15 + 106.62 + 447.37 + 68.04 + 8.32 + 36.71 + 12.00 + 110.02 + 2536.07 + 1302.00 + 33.06 = \\mathbf{${totalDesignEnergy.toFixed(2)}\\text{ MU}}$\n\n` +
           `💡 **Navigation Guide:** Need basin-wise percentage distributions or station comparisons?`;
  }

  private generateMasterGlobalReport(stations: any[], directors: any[], tenders: any[]): string {
    const opStations = stations.filter(s => s.status === 'Operational');
    const totalOpCap = opStations.reduce((sum, s) => sum + s.capacityMw, 0);

    return `### Master Corporate Website & Project Synthesis — HYDRO (v2026.1)\n\n` +
           `**1. Summary:** The JKSPDC portal integrates **67 website routes**, **14 power stations** (${totalOpCap.toFixed(1)} MW Operational, 390 MW Upcoming), **4 Senior Executive Dignitaries** (${directors.map(d => d.name).join(', ')}), **3 Active Procurement Tenders**, and **6 Main Portal Wings** (About Us, Our Business, Stakeholders & Investors, Commercial Operations, Sustainability & CSR, Media Center).\n\n` +
           `**2. Key Website Portals & Navigation Links:**\n` +
           `- **[Operating Power Stations](/our-business/power-stations)** — Hydroelectric asset details & technical specs.\n` +
           `- **[Projects Under Development](/our-business/under-development)** — DPRs & upcoming projects (Kirthai Stage-1).\n` +
           `- **[Tenders & Procurement Portal](/stakeholders/vendors/tender-bids)** — eNIT downloads, corrigendums & bidding.\n` +
           `- **[Online Payment Gateway](/stakeholders/vendors/online-payment)** — EMD & tender document fee submission.\n` +
           `- **[Board of Directors](/about-us/management/board)** — Executive leadership & governance.\n` +
           `- **[Financial Results](/stakeholders/investors/financial-results)** — Balance sheets & audit reports.\n` +
           `- **[Commercial Operations & Tariff](/commercial/tariff)** — Approved tariff schedules & SERC petitions.\n` +
           `- **[CSR Policy & Reports](/sustainability/csr/policy)** — Corporate social responsibility guidelines.\n` +
           `- **[Environmental Clearances](/sustainability/environment/clearance)** — MoEFCC clearance certificates.\n` +
           `- **[Website Sitemap](/sitemap)** — Full index of all 67 portal routes.\n\n` +
           `**3. Active Procurement Tenders:**\n` +
           `${tenders.map(t => `- \`${t.referenceNo}\`: **[${t.title}](/stakeholders/vendors/tender-bids)** (${t.workCategory}, Due: ${t.closingDate ? new Date(t.closingDate).toLocaleDateString('en-IN') : 'Open'})`).join('\n')}\n\n` +
           `💡 **How can I assist?** Ask me to guide you to any form, policy, commercial tariff, or project analysis!`;
  }

  private explainCurrentPage(url?: string): string {
    if (!url) return "You are currently browsing the official JKSPDCL web platform.";
    const route = this.websiteRoutes.find(r => r.url === url || url.includes(r.url));
    if (route) {
      return `You are currently on the **[${route.title}](${route.url})** page.\n\n` +
             `**Page Function:** ${route.description}\n\n` +
             `Feel free to ask me any question about this section or ask me to guide you to any other portal on the website!`;
    }
    return `You are currently viewing: \`${url}\`. Feel free to ask me to guide you anywhere across our website!`;
  }
}
