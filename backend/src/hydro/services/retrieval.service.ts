import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  content: string;
  heading?: string;
  title: string;
  sourceUrl?: string;
  documentType?: string;
  sectionRef?: string;
  pageNumber?: number;
  publicationDate?: Date | null;
  score: number;
  searchType: 'semantic' | 'keyword' | 'database' | 'override';
}

/**
 * Retrieval Service — Hybrid search orchestrator combining semantic, keyword, and database search.
 * Merges results using Reciprocal Rank Fusion (RRF) and deduplicates.
 */
@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  /**
   * Main hybrid retrieval — returns merged, deduplicated, ranked chunks.
   */
  async retrieve(query: string, topK: number = 8): Promise<RetrievedChunk[]> {
    const results: RetrievedChunk[] = [];

    // 1. Check admin overrides first
    const overrides = await this.checkAdminOverrides(query);
    if (overrides.length > 0) {
      results.push(...overrides);
    }

    // 2. Semantic vector search
    const semanticResults = await this.semanticSearch(query, topK * 2);
    results.push(...semanticResults);

    // 3. Keyword/BM25-style search via Prisma
    const keywordResults = await this.keywordSearch(query, topK * 2);
    results.push(...keywordResults);

    // 4. Live database search (structured data)
    const dbResults = await this.databaseSearch(query);
    results.push(...dbResults);

    // 5. Reciprocal Rank Fusion + Deduplication
    const merged = this.mergeAndRank(results, topK);

    return merged;
  }

  /**
   * Semantic search using vector embeddings.
   */
  private async semanticSearch(query: string, topK: number): Promise<RetrievedChunk[]> {
    try {
      const queryEmbedding = await this.embeddingService.embedQuery(query);
      if (!queryEmbedding) return [];

      const vectorResults = this.vectorStore.search(queryEmbedding, topK);
      if (vectorResults.length === 0) return [];

      const chunkIds = vectorResults.map(r => r.id);
      const chunks = await this.prisma.hydroChunk.findMany({
        where: { id: { in: chunkIds } },
        include: { document: true },
      });

      const chunkMap = new Map(chunks.map(c => [c.id, c]));

      return vectorResults
        .filter(vr => chunkMap.has(vr.id))
        .map(vr => {
          const chunk = chunkMap.get(vr.id)!;
          return {
            chunkId: chunk.id,
            documentId: chunk.documentId,
            content: chunk.content,
            heading: chunk.heading || undefined,
            title: chunk.document.title,
            sourceUrl: chunk.document.sourceUrl || undefined,
            documentType: chunk.document.documentType || undefined,
            sectionRef: chunk.sectionRef || undefined,
            pageNumber: chunk.pageNumber || undefined,
            publicationDate: chunk.document.publicationDate,
            score: vr.score,
            searchType: 'semantic' as const,
          };
        });
    } catch (err: any) {
      this.logger.error(`Semantic search failed: ${err.message}`);
      return [];
    }
  }

  /**
   * Keyword search using Prisma text matching (BM25-style).
   */
  private async keywordSearch(query: string, topK: number): Promise<RetrievedChunk[]> {
    try {
      const tokens = query
        .toLowerCase()
        .replace(/[^a-z0-9\s\-\/]/g, '')
        .split(/\s+/)
        .filter(t => t.length >= 2 && !this.isStopWord(t));

      if (tokens.length === 0) return [];

      const chunks = await this.prisma.hydroChunk.findMany({
        where: {
          OR: tokens.map(token => ({
            content: { contains: token },
          })),
          document: { status: 'active' },
        },
        include: { document: true },
        take: topK,
      });

      return chunks.map(chunk => {
        const lower = chunk.content.toLowerCase();
        const matchCount = tokens.filter(t => lower.includes(t)).length;
        const score = matchCount / tokens.length;

        return {
          chunkId: chunk.id,
          documentId: chunk.documentId,
          content: chunk.content,
          heading: chunk.heading || undefined,
          title: chunk.document.title,
          sourceUrl: chunk.document.sourceUrl || undefined,
          documentType: chunk.document.documentType || undefined,
          sectionRef: chunk.sectionRef || undefined,
          pageNumber: chunk.pageNumber || undefined,
          publicationDate: chunk.document.publicationDate,
          score: score * 0.8,
          searchType: 'keyword' as const,
        };
      });
    } catch (err: any) {
      this.logger.error(`Keyword search failed: ${err.message}`);
      return [];
    }
  }

  /**
   * Live database search — queries structured data from existing Prisma models.
   */
  private async databaseSearch(query: string): Promise<RetrievedChunk[]> {
    const lower = query.toLowerCase();
    const results: RetrievedChunk[] = [];

    try {
      // 0. Employees Corner Links & Portals
      if (/\b(employee|employees|employee corner|employees corner|staff|cornor|link|links|webmail|nicefile|nic-e-file|eoffice|e-office|hrms|jkhrms|property return|gad|eetms|bg management|asset management)\b/i.test(lower)) {
        results.push({
          chunkId: 'db-employee-corner',
          documentId: 'live-database',
          content: `### Employees Corner — Available Online Portals & Direct Links\n\n` +
            `JKSPDCL provides 8 official online portals for its officers and employees:\n\n` +
            `1. **Web Mail:** Official departmental email login\n   - **Link:** https://www.jkspdcl.com:2096/\n` +
            `2. **Nic-e-File:** NIC electronic file movement system\n   - **Link:** https://saccess.nic.in/\n` +
            `3. **E-Office:** J&K Government electronic office file processing\n   - **Link:** https://eoffice.jk.gov.in/\n` +
            `4. **JKHMRS:** Human Resource Management System (service book & leave portal)\n   - **Link:** https://hrms.jk.gov.in/\n` +
            `5. **Property Return (GAD):** Annual immovable property returns portal\n   - **Link:** https://prs.jk.gov.in/\n` +
            `6. **EETMS:** E-Efficiency Tracking & Legal Case Management System\n   - **Link:** https://law.pmgatishakti.gov.in/EETMS/login\n` +
            `7. **BG Management:** Online Bank Guarantee tracking and verification portal\n   - **Link:** https://bg.jkspdc.in/\n` +
            `8. **Asset Management:** Fixed assets and equipment inventory management\n   - **Link:** https://jkspdc.inrdeals.in/login\n\n` +
            `All links are directly accessible via the Employees Corner dropdown on the main website navigation bar.`,
          title: 'Employees Corner Portals & Links',
          sourceUrl: '/about-us/explore/overview',
          documentType: 'employees_corner',
          score: 0.95,
          searchType: 'database',
        });
      }

      // 0.1 Hydro Potential & Capacity Overview
      if (/\b(potential|potentials|hydel potential|power potential|total potential|generation potential|resources|capacity)\b/i.test(lower)) {
        results.push({
          chunkId: 'db-hydro-potential',
          documentId: 'live-database',
          content: `### Hydroelectric Potential & Power Generation in Jammu & Kashmir\n\n` +
            `- **Total Estimated Hydro Potential:** Approximately **20,000 MW** identified across four major river basins (**Chenab, Jhelum, Ravi, and Indus**).\n` +
            `- **Economically Exploitable Potential (CEA Assessed):** **14,867 MW** identified by the Central Electricity Authority.\n` +
            `- **Basin-wise Distribution:**\n` +
            `  - **Chenab Basin:** ~10,360 MW (highest hydel potential)\n` +
            `  - **Jhelum Basin:** ~3,060 MW\n` +
            `  - **Ravi Basin:** ~500 MW\n` +
            `  - **Indus & Ladakh Tributaries:** ~947 MW\n` +
            `- **JKSPDCL Generation Capacity:** Total portfolio of **2,593 MW** (including operational, under construction, and joint venture projects).\n` +
            `- **Operational Capacity:** **1,197.40 MW** across 13 active hydroelectric stations, led by the **900 MW Baglihar HEP complex** (Stage-I 450 MW + Stage-II 450 MW), **Lower Jhelum (105 MW)**, and **Upper Sindh-II (105 MW)**.`,
          title: 'Hydroelectric Potential & Power Generation',
          sourceUrl: '/our-business/power-stations',
          documentType: 'power_potential',
          score: 0.95,
          searchType: 'database',
        });
      }

      // 0.2 GSTIN & Tax Details
      if (/\b(gst|gstin|pan|cin|tax|taxation|tax registration|goods and services tax)\b/i.test(lower)) {
        results.push({
          chunkId: 'db-gstin',
          documentId: 'live-database',
          content: `### GSTIN Registration Details — JKSPDCL\n\n` +
            `- **Legal Entity:** Jammu & Kashmir State Power Development Corporation Limited\n` +
            `- **Primary GSTIN (J&K):** **01AACCJ5612K1ZX**\n` +
            `- **Corporate Identification Number (CIN):** **U40101JK1995SGC001418**\n` +
            `- **Permanent Account Number (PAN):** **AACCJ5612K**\n` +
            `- **Taxpayer Status:** State Government PSU / Commercial Power Utility\n` +
            `- **Head Offices:** Exhibition Ground, Srinagar (190009) & Ashok Nagar, Satwari, Jammu (180004).`,
          title: 'GSTIN Registration Details',
          sourceUrl: '/about-us/explore/gstin-registration',
          documentType: 'taxation',
          score: 0.95,
          searchType: 'database',
        });
      }

      if (/\b(station|project|hep|power|capacity|mw|megawatt|baglihar|bhep|chep|ushp|ljhp|kirthai|sewa|ganderbal|karnah|pahalgam|bhaderwah|sanjak|hanu|mohra|how many)\b/i.test(lower)) {
        const stations = await this.prisma.powerStation.findMany({ orderBy: { capacityMw: 'desc' } });
        if (stations.length > 0) {
          const totalMw = stations.reduce((s, p) => s + (p.capacityMw || 0), 0);
          const stationText = stations.map((s, i) =>
            `${i + 1}. ${s.name}: ${s.capacityMw} MW, Type: ${s.type}, Location: ${s.location || 'J&K'}, Status: ${s.status}${s.configuration ? `, Config: ${s.configuration}` : ''}${s.yearOfCommissioning ? `, Commissioned: ${s.yearOfCommissioning}` : ''}${s.basin ? `, Basin: ${s.basin}` : ''}`
          ).join('\n');
          results.push({
            chunkId: 'db-stations',
            documentId: 'live-database',
            content: `JKSPDC Power Stations Portfolio (${stations.length} stations, Total: ${totalMw.toFixed(1)} MW):\n${stationText}`,
            title: 'Operating Power Stations',
            sourceUrl: '/our-business/power-stations',
            documentType: 'database',
            score: 0.85,
            searchType: 'database',
          });
        }
      }

      if (/\b(board|director|leadership|chairman|md|managing director|governor|chief minister|who leads|who runs)\b/i.test(lower)) {
        const directors = await this.prisma.director.findMany({ orderBy: { sNo: 'asc' } });
        if (directors.length > 0) {
          const dirText = directors.map(d => `- ${d.name}: ${d.position} (${d.role})`).join('\n');
          results.push({
            chunkId: 'db-directors',
            documentId: 'live-database',
            content: `Board of Directors (${directors.length} members):\n${dirText}`,
            title: 'Board of Directors',
            sourceUrl: '/about-us/management/board',
            documentType: 'database',
            score: 0.85,
            searchType: 'database',
          });
        }
      }

      if (/\b(tender|tenders|nit|enit|bid|bids|procurement|rfp|corrigendum)\b/i.test(lower)) {
        const tenders = await this.prisma.tender.findMany({
          orderBy: { publishDate: 'desc' },
          take: 15,
        });
        if (tenders.length > 0) {
          const tenderText = tenders.map(t =>
            `- ${t.title} (Ref: ${t.referenceNo}, Status: ${t.status}, Published: ${t.publishDate ? new Date(t.publishDate).toLocaleDateString('en-IN') : 'N/A'}${t.closingDate ? `, Closing: ${new Date(t.closingDate).toLocaleDateString('en-IN')}` : ''})`
          ).join('\n');
          results.push({
            chunkId: 'db-tenders',
            documentId: 'live-database',
            content: `Active Tenders & Notices (${tenders.length} entries):\n${tenderText}`,
            title: 'Tenders & Bids Portal',
            sourceUrl: '/stakeholders/vendors/tender-bids',
            documentType: 'database',
            score: 0.85,
            searchType: 'database',
          });
        }
      }

      if (/\b(notification|notifications|notice|notices|circular|order|latest)\b/i.test(lower)) {
        const notifications = await this.prisma.notification.findMany({
          orderBy: { publishDate: 'desc' },
          take: 10,
        });
        if (notifications.length > 0) {
          const notifText = notifications.map(n =>
            `- ${n.title} (File: ${n.fileName}, Date: ${new Date(n.publishDate).toLocaleDateString('en-IN')})`
          ).join('\n');
          results.push({
            chunkId: 'db-notifications',
            documentId: 'live-database',
            content: `Latest Notifications (${notifications.length} entries):\n${notifText}`,
            title: 'Notifications',
            sourceUrl: '/notifications',
            documentType: 'database',
            score: 0.80,
            searchType: 'database',
          });
        }
      }

      if (/\b(career|careers|job|jobs|recruitment|vacancy|opening|employment|advertisement)\b/i.test(lower)) {
        const careers = await this.prisma.career.findMany({
          orderBy: { publishDate: 'desc' },
          take: 10,
        });
        if (careers.length > 0) {
          const careerText = careers.map(c =>
            `- ${c.title} (Advt No: ${c.advertisementNo}, Status: ${c.status}, Closing: ${new Date(c.closingDate).toLocaleDateString('en-IN')})`
          ).join('\n');
          results.push({
            chunkId: 'db-careers',
            documentId: 'live-database',
            content: `Career Openings (${careers.length} entries):\n${careerText}`,
            title: 'Current Openings & Careers',
            sourceUrl: '/stakeholders/career-seekers/current-openings',
            documentType: 'database',
            score: 0.80,
            searchType: 'database',
          });
        }
      }

      if (/\b(contact|phone|email|executive|directory|office|address|headquarters)\b/i.test(lower)) {
        const executives = await this.prisma.executive.findMany({ orderBy: { sNo: 'asc' }, take: 20 });
        if (executives.length > 0) {
          const execText = executives.map(e =>
            `- ${e.name}: ${e.designation}${e.department ? ` (${e.department})` : ''}${e.phone ? `, Phone: ${e.phone}` : ''}${e.email ? `, Email: ${e.email}` : ''}`
          ).join('\n');
          results.push({
            chunkId: 'db-executives',
            documentId: 'live-database',
            content: `Senior Executives Directory (${executives.length} entries):\n${execText}`,
            title: 'Phone Directory of Senior Executives',
            sourceUrl: '/about-us/explore/executives-directory',
            documentType: 'database',
            score: 0.80,
            searchType: 'database',
          });
        }
      }

      if (/\b(policy|policies|csr|vigilance|ethics|code|guideline|framework)\b/i.test(lower)) {
        const policies = await this.prisma.policyDocument.findMany({
          where: { status: 'Active' },
          orderBy: { createdAt: 'desc' },
        });
        if (policies.length > 0) {
          const policyText = policies.map(p =>
            `- ${p.title} (Category: ${p.category}, Status: ${p.status})`
          ).join('\n');
          results.push({
            chunkId: 'db-policies',
            documentId: 'live-database',
            content: `Corporate Policies (${policies.length} active):\n${policyText}`,
            title: 'Corporate Policies',
            sourceUrl: '/about-us/explore/policies',
            documentType: 'database',
            score: 0.75,
            searchType: 'database',
          });
        }
      }
    } catch (err: any) {
      this.logger.error(`Database search failed: ${err.message}`);
    }

    return results;
  }

  /**
   * Check admin overrides for exact-match questions.
   */
  private async checkAdminOverrides(query: string): Promise<RetrievedChunk[]> {
    try {
      const lower = query.toLowerCase().trim();
      const overrides = await this.prisma.hydroAdminOverride.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });

      for (const o of overrides) {
        if (lower.includes(o.question.toLowerCase()) || o.question.toLowerCase().includes(lower)) {
          return [{
            chunkId: `override-${o.id}`,
            documentId: 'admin-override',
            content: o.answer,
            title: 'Official Information',
            score: 1.0,
            searchType: 'override',
          }];
        }
      }
    } catch (err: any) {
      this.logger.warn(`Admin override check failed: ${err.message}`);
    }
    return [];
  }

  /**
   * Reciprocal Rank Fusion — merges results from multiple search strategies.
   */
  private mergeAndRank(results: RetrievedChunk[], topK: number): RetrievedChunk[] {
    const seen = new Set<string>();
    const unique: RetrievedChunk[] = [];

    results.sort((a, b) => b.score - a.score);

    for (const r of results) {
      const key = r.chunkId;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    }

    unique.sort((a, b) => {
      if (a.searchType === 'override' && b.searchType !== 'override') return -1;
      if (b.searchType === 'override' && a.searchType !== 'override') return 1;
      return b.score - a.score;
    });

    return unique.slice(0, topK);
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'is', 'at', 'in', 'of', 'on', 'to', 'a', 'an', 'and', 'or', 'for',
      'it', 'its', 'this', 'that', 'are', 'was', 'be', 'has', 'have', 'had', 'do',
      'does', 'did', 'but', 'not', 'what', 'which', 'who', 'whom', 'how', 'when',
      'where', 'why', 'with', 'from', 'can', 'will', 'me', 'my', 'our', 'we', 'you',
      'your', 'he', 'she', 'they', 'them', 'about', 'also', 'been', 'being', 'by',
    ]);
    return stopWords.has(word);
  }
}
