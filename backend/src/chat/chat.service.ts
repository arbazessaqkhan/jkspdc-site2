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

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // List of keywords/topics explicitly out of domain
  private readonly outOfDomainKeywords = [
    'stock', 'crypto', 'bitcoin', 'forecast', 'weather', 'movie', 'film',
    'actor', 'actress', 'sports', 'football', 'cricket', 'astrology',
    'horoscope', 'recipe', 'cooking', 'song', 'music', 'homework',
    'politics', 'election', 'president'
  ];

  async handleUserMessage(dto: ChatRequestDto) {
    const rawInput = (dto.message || '').trim();
    if (!rawInput) {
      return {
        reply: "Hello! I'm Hydro, your AI assistant. How can I help you today?",
      };
    }

    const lowerInput = rawInput.toLowerCase();

    // 1. Check for greeting
    if (this.isGreeting(lowerInput)) {
      return {
        reply: "Hello! I'm Hydro, your AI assistant. How can I help you today?",
      };
    }

    // 2. Out-of-Domain Guardrail Check
    if (this.isOutOfDomain(lowerInput)) {
      return {
        reply: "I'm sorry, but that question is outside my domain. Please ask something related to this website or project.",
      };
    }

    // 3. Current Page Context Awareness
    if (lowerInput.includes('what page') || lowerInput.includes('where am i') || lowerInput === 'this page') {
      const pageInfo = this.explainCurrentPage(dto.currentPage);
      return { reply: pageInfo };
    }

    // 4. Retrieve Database Knowledge
    const [stations, directors, tenders, careers] = await Promise.all([
      this.prisma.powerStation.findMany(),
      this.prisma.director.findMany({ orderBy: { sNo: 'asc' } }),
      this.prisma.tender.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      this.prisma.career.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    // 5. Specific Topic Matching

    // A) Kirthai HEP Stage-1 / Upcoming Projects
    if (lowerInput.includes('kirthai') || (lowerInput.includes('upcoming') && lowerInput.includes('project'))) {
      const kirthai = stations.find((s: any) => s.name.toLowerCase().includes('kirthai'));
      if (kirthai) {
        return {
          reply: `### Kirthai HEP Stage-1 (Upcoming Project)\n\n**Kirthai HEP Stage-1** is a landmark run-of-river hydroelectric scheme on the river Chenab located at Gulabgarh, Padder in Kishtwar district of Jammu & Kashmir (~66 km from Kishtwar town).\n\n**Salient Features:**\n- **Installed Capacity:** 390 MW\n- **Gross Head:** 108.5 m\n- **Height of Dam:** 119.50 m (above river bed level)\n- **Length of Dam at Top:** 252.45 m\n- **Reservoir Stretch:** 9.50 km\n- **Power House:** Underground (133.5 x 20.0 x 43.5 m)\n\nFor full project documentation and details, visit the [Projects Under Development](/our-business/under-development) page.`,
        };
      }
    }

    // B) Operating Power Stations / Hydro Electric Projects
    if (lowerInput.includes('operating') || lowerInput.includes('power station') || lowerInput.includes('capacity') || lowerInput.includes('baglihar') || lowerInput.includes('bhep') || lowerInput.includes('ljhp')) {
      const opStations = stations.filter((s: any) => s.status === 'Operational');
      const totalCapacity = opStations.reduce((sum: number, s: any) => sum + (s.capacityMw || 0), 0);
      
      let listStr = opStations.map((s: any) => `- **[${s.name}](/our-business/power-station-details?id=${s.id})**: ${s.capacityMw} MW (${s.location || 'UT of J&K'})`).join('\n');

      return {
        reply: `### Operational Power Stations\n\nJKSPDCL currently operates **${opStations.length} hydroelectric power stations** with a total installed capacity of **${totalCapacity.toFixed(1)} MW** across the Jhelum, Chenab, and Ravi basins:\n\n${listStr}\n\nYou can explore detailed technical specifications on the [Operating Power Stations](/our-business/power-stations) page.`,
      };
    }

    // C) Board of Directors / Leadership / Dignitaries
    if (lowerInput.includes('director') || lowerInput.includes('board') || lowerInput.includes('chairman') || lowerInput.includes('managing director') || lowerInput.includes('manoj sinha') || lowerInput.includes('omar abdullah') || lowerInput.includes('rahul yadav') || lowerInput.includes('ashwani')) {
      let dirStr = directors.map((d: any) => `- **${d.name}**: ${d.position} (*${d.role}*)`).join('\n');

      return {
        reply: `### Board of Directors & Leadership\n\nThe governance and administration of JKSPDCL is led by the following honorable dignitaries:\n\n${dirStr}\n\nFor more information on corporate governance, visit the [Board of Directors](/about-us/management/board) page.`,
      };
    }

    // D) Tenders & Bids
    if (lowerInput.includes('tender') || lowerInput.includes('bid') || lowerInput.includes('rfp') || lowerInput.includes('procurement') || lowerInput.includes('nit')) {
      if (tenders.length === 0) {
        return {
          reply: `### Tenders & E-Procurement\n\nThere are currently no active tenders listed in the portal. You can monitor upcoming notifications on the [Tenders Portal](/stakeholders/tenders) page.`,
        };
      }

      let tenderStr = tenders.slice(0, 4).map((t: any) => `- **${t.title}** (Reference: ${t.referenceNo || 'N/A'}) - Due: ${t.closingDate ? new Date(t.closingDate).toLocaleDateString('en-IN') : 'Open'}`).join('\n');

      return {
        reply: `### Latest Tenders & Procurements\n\nHere are recent tender notices issued by JKSPDCL:\n\n${tenderStr}\n\nTo view all active tenders, download RFP documents, or check submission guidelines, please visit the [Tenders Portal](/stakeholders/tenders) page.`,
      };
    }

    // E) Careers / Job Openings / Recruitment
    if (lowerInput.includes('career') || lowerInput.includes('job') || lowerInput.includes('vacancy') || lowerInput.includes('recruitment') || lowerInput.includes('apply')) {
      if (careers.length === 0) {
        return {
          reply: `### Careers & Recruitment\n\nThere are currently no open recruitment notices. All job vacancies and official recruitment notifications are published on the [Careers](/careers/openings) page.`,
        };
      }

      let careerStr = careers.map((c: any) => `- **${c.title}** (Advt No: ${c.advertisementNo || 'N/A'}) - Deadline: ${c.closingDate ? new Date(c.closingDate).toLocaleDateString('en-IN') : 'Open'}`).join('\n');

      return {
        reply: `### Careers & Recruitment Opportunities\n\nHere are the latest career notifications:\n\n${careerStr}\n\nFor eligibility criteria and application instructions, visit the [Careers](/careers/openings) page.`,
      };
    }

    // F) Contact Info / Headquarters / Address
    if (lowerInput.includes('contact') || lowerInput.includes('address') || lowerInput.includes('email') || lowerInput.includes('phone') || lowerInput.includes('office') || lowerInput.includes('headquarter')) {
      return {
        reply: `### Contact Information\n\n**Jammu & Kashmir State Power Development Corporation Limited (JKSPDCL)**\n\n- **Exhibition Ground Corporate HQ:** Exhibition Ground, Srinagar / Ashok Nagar, Jammu\n- **Official Website:** [JKSPDCL Home](https://jkspdc.nic.in)\n- **Email:** contact@jkspdc.org / info@jkspdc.nic.in\n- **Phone:** 0194-2500071 (Srinagar) / 0191-2483567 (Jammu)\n\nFor regional division contacts, feedback forms, and department numbers, visit the [Contact Us](/contact) page.`,
      };
    }

    // G) Policies / Code of Ethics / CSR
    if (lowerInput.includes('policy') || lowerInput.includes('ethics') || lowerInput.includes('conduct') || lowerInput.includes('csr') || lowerInput.includes('environmental')) {
      return {
        reply: `### Governance, Ethics & Corporate Policies\n\nJKSPDCL follows strict operational and governance standards:\n\n- **Code of Ethics & Conduct:** Standard rules governing board members, executives, and staff.\n- **Environmental & Social Policy:** Guidelines ensuring minimal ecological impact across river basins.\n- **CSR Initiatives:** Social welfare programs empowering local communities in Jammu & Kashmir.\n\nYou can read complete policy documents on the [Code of Ethics](/about-us/explore/ethics-code) and [CSR Overview](/sustainability/csr/overview) pages.`,
      };
    }

    // H) Navigation & General Features
    if (lowerInput.includes('navigat') || lowerInput.includes('where can i') || lowerInput.includes('how to find')) {
      return {
        reply: `### Website Navigation Guide\n\nHere are key sections you can explore:\n\n1. **[Operating Power Stations](/our-business/power-stations)** - View all functional hydroelectric facilities.\n2. **[Projects Under Development](/our-business/under-development)** - Explore upcoming projects like Kirthai HEP Stage-1.\n3. **[Board of Directors](/about-us/management/board)** - Meet executive leadership and dignitaries.\n4. **[Tenders Portal](/stakeholders/tenders)** - Access bidding documents and procurement notices.\n5. **[Media Gallery](/media/gallery)** - View official event photographs and site construction media.`,
      };
    }

    // 6. Generic Fallback Search over Power Stations, Directors, and Tenders
    const matchingStation = stations.find((s: any) => s.name.toLowerCase().includes(lowerInput) || s.location?.toLowerCase().includes(lowerInput) || s.basin?.toLowerCase().includes(lowerInput));
    if (matchingStation) {
      return {
        reply: `### ${matchingStation.name}\n\n- **Type:** ${matchingStation.type || 'Hydro'}\n- **Capacity:** ${matchingStation.capacityMw} MW\n- **Status:** ${matchingStation.status}\n- **Location:** ${matchingStation.location || 'J&K'}\n- **Basin:** ${matchingStation.basin || 'N/A'}\n\n${matchingStation.description ? matchingStation.description + '\n\n' : ''}For complete salient features, visit the [Power Station Details](/our-business/power-station-details?id=${matchingStation.id}) page.`,
      };
    }

    // 7. Final Unknown Information response
    return {
      reply: "I couldn't find this information in the available project data.",
    };
  }

  private isGreeting(text: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'who are you'];
    return greetings.some(g => text === g || text.startsWith(g + ' ') || text.endsWith(' ' + g));
  }

  private isOutOfDomain(text: string): boolean {
    return this.outOfDomainKeywords.some(keyword => text.includes(keyword));
  }

  private explainCurrentPage(url?: string): string {
    if (!url) return "You are currently browsing the official JKSPDCL website.";
    
    if (url.includes('/power-stations')) {
      return "You are on the **Operating Power Stations** page, which lists all active hydroelectric power stations in J&K state and central sectors.";
    }
    if (url.includes('/under-development')) {
      return "You are on the **Projects Under Development** page, featuring upcoming hydro projects such as **Kirthai HEP Stage-1 (390 MW)**.";
    }
    if (url.includes('/board')) {
      return "You are on the **Board of Directors** page, detailing the executive leadership and dignitaries of JKSPDCL.";
    }
    if (url.includes('/tenders')) {
      return "You are on the **Tenders Portal** page, where active procurement notices and RFP documents are published.";
    }
    if (url.includes('/contact')) {
      return "You are on the **Contact Us** page, providing corporate headquarters addresses and phone numbers.";
    }

    return `You are currently viewing: \`${url}\`. Ask me any question about this page or JKSPDCL operations!`;
  }
}
