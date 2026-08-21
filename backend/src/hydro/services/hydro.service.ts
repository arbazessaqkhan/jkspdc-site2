import { Injectable, Logger } from '@nestjs/common';
import { ScopeService } from './scope.service';
import { QueryService } from './query.service';
import { RetrievalService } from './retrieval.service';
import { GroundingService } from './grounding.service';
import { LlmService } from './llm.service';
import { ConversationService } from './conversation.service';
import { CitationService } from './citation.service';
import { AnalyticsService } from './analytics.service';
import {
  HydroChatRequestDto,
  HydroChatResponse,
  HydroSearchRequestDto,
  HydroSearchResult,
  HydroFeedbackDto,
  HydroAdminStatus,
} from '../dto';
import {
  buildHydroPrompt,
  OUT_OF_SCOPE_RESPONSE,
  INSUFFICIENT_EVIDENCE_RESPONSE,
} from '../prompts/system-prompt';
import { PrismaService } from '../../prisma.service';
import { VectorStoreService } from './vector-store.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { PageCrawlerService } from '../ingestion/page-crawler.service';

/**
 * Hydro Service — Master orchestrator for the HYDRO AI Knowledge Assistant platform.
 */
@Injectable()
export class HydroService {
  private readonly logger = new Logger(HydroService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeService: ScopeService,
    private readonly queryService: QueryService,
    private readonly retrievalService: RetrievalService,
    private readonly groundingService: GroundingService,
    private readonly llmService: LlmService,
    private readonly conversationService: ConversationService,
    private readonly citationService: CitationService,
    private readonly analyticsService: AnalyticsService,
    private readonly vectorStore: VectorStoreService,
    private readonly ingestionService: IngestionService,
    private readonly pageCrawler: PageCrawlerService,
  ) {}

  /**
   * Main conversational interface for HYDRO AI.
   */
  async handleChat(dto: HydroChatRequestDto): Promise<HydroChatResponse> {
    const startTime = Date.now();
    const sessionId = dto.sessionId || 'anonymous-session';
    const rawInput = (dto.message || '').trim();

    if (!rawInput) {
      return {
        reply: "Hello! I am **HYDRO**, the official AI knowledge assistant for JKSPDCL. How can I assist you with information regarding power stations, tenders, notifications, corporate policies, or website navigation?",
        confidence: 'high',
        suggestedQuestions: this.getDefaultSuggestions(),
      };
    }

    // 1. Sanitize input
    const cleanInput = this.scopeService.sanitizeInput(rawInput);

    // 2. Prompt Injection Defense
    if (this.scopeService.detectPromptInjection(cleanInput)) {
      this.logger.warn(`Prompt injection attempt detected: "${cleanInput}"`);
      return {
        reply: this.scopeService.getInjectionRefusal(),
        confidence: 'high',
        suggestedQuestions: this.getDefaultSuggestions(),
      };
    }

    // 3. Greeting Check
    if (this.scopeService.isGreeting(cleanInput)) {
      return {
        reply: "Hello! I am **HYDRO**, the official website information assistant for **Jammu & Kashmir State Power Development Corporation Limited (JKSPDCL)**.\n\nI can help you with factual information published on this portal, including:\n- **Power Projects & Stations** (e.g., Baglihar 900 MW, Upper Sindh, Lower Jhelum)\n- **Active Tenders & eNIT Notices**\n- **Board of Directors & Governance**\n- **Corporate Policies & GSTIN Details**\n- **Career Openings & RTI Disclosures**\n\nWhat would you like to know?",
        confidence: 'high',
        suggestedQuestions: this.getDefaultSuggestions(),
      };
    }

    // 4. Scope Classification Pre-Check
    const scope = this.scopeService.classifyScope(cleanInput);
    if (scope === 'out_of_scope') {
      return {
        reply: OUT_OF_SCOPE_RESPONSE,
        confidence: 'low',
        suggestedQuestions: this.getDefaultSuggestions(),
      };
    }

    // 5. Query Expansion & Context Resolution
    const expandedQuery = this.queryService.expandQuery(cleanInput);

    // 6. Hybrid Knowledge Retrieval
    const retrievedChunks = await this.retrievalService.retrieve(expandedQuery, 6);

    // 7. Grounding & Confidence Evaluation
    const confidence = this.groundingService.evaluateConfidence(retrievedChunks);

    if (confidence === 'low' && retrievedChunks.length === 0) {
      return {
        reply: INSUFFICIENT_EVIDENCE_RESPONSE,
        confidence: 'low',
        suggestedQuestions: this.getDefaultSuggestions(),
      };
    }

    // 8. Assemble Context & Conversation History
    const formattedContext = this.groundingService.formatContext(retrievedChunks);
    const historyString = this.conversationService.formatHistoryForPrompt(sessionId, dto.history);
    const currentPage = dto.currentPage || 'JKSPDC Portal';

    const systemPrompt = buildHydroPrompt({
      context: formattedContext,
      currentPage,
      conversationHistory: historyString,
    });

    // 9. LLM Generation
    let answer: string | null = null;

    if (await this.llmService.isAvailable()) {
      answer = await this.llmService.generateResponse(systemPrompt, cleanInput);
    }

    // 10. Fallback Rule-Engine Generation if LLM unavailable or offline
    if (!answer) {
      answer = this.generateDirectEvidenceAnswer(cleanInput, retrievedChunks);
    }

    // 11. Extract and append citations
    const citations = this.groundingService.extractCitations(retrievedChunks);
    const citationCards = this.citationService.formatSourceCards(citations);

    const fullReply = `${answer.trim()}${citationCards}`;

    // 12. Save turn to session memory
    this.conversationService.addTurn(sessionId, cleanInput, fullReply);

    // 13. Log conversation for quality analytics
    const latencyMs = Date.now() - startTime;
    const conversationId = await this.analyticsService.logConversation({
      sessionId,
      userMessage: cleanInput,
      botResponse: fullReply,
      confidence,
      sourcesUsed: citations,
      latencyMs,
      currentPage,
    });

    return {
      reply: fullReply,
      sources: citations,
      confidence,
      conversationId: conversationId || undefined,
      suggestedQuestions: this.generateFollowUpSuggestions(cleanInput),
    };
  }

  /**
   * Natural language website search.
   */
  async handleSearch(dto: HydroSearchRequestDto): Promise<HydroSearchResult[]> {
    const cleanQuery = this.scopeService.sanitizeInput(dto.query || '');
    const expanded = this.queryService.expandQuery(cleanQuery);
    const chunks = await this.retrievalService.retrieve(expanded, dto.limit || 5);

    return chunks.map(c => ({
      title: c.title,
      snippet: c.content.substring(0, 200) + (c.content.length > 200 ? '...' : ''),
      url: c.sourceUrl,
      documentType: c.documentType,
      date: c.publicationDate ? new Date(c.publicationDate).toISOString().split('T')[0] : undefined,
      relevanceScore: Math.round(c.score * 100),
    }));
  }

  /**
   * Instant whole-website autocomplete search suggestions for live typing in HYDRO.
   */
  async handleSuggest(query: string): Promise<Array<{ title: string; url: string; category: string; type: string; subtitle?: string }>> {
    const raw = (query || '').trim().toLowerCase();
    if (!raw || raw.length < 2) return [];

    const suggestions: Array<{ title: string; url: string; category: string; type: string; subtitle?: string }> = [];
    const seen = new Set<string>();

    const addSuggestion = (item: { title: string; url: string; category: string; type: string; subtitle?: string }) => {
      const key = `${item.title}_${item.url}`;
      if (!seen.has(key) && suggestions.length < 8) {
        seen.add(key);
        suggestions.push(item);
      }
    };

    // 1. Check Employee Corner Links
    const employeeLinks = [
      { title: 'Web Mail Portal', url: 'https://www.jkspdcl.com:2096/', category: 'Employees Corner', subtitle: 'Official Departmental Email Login' },
      { title: 'Nic-e-File', url: 'https://saccess.nic.in/', category: 'Employees Corner', subtitle: 'NIC Electronic File Movement System' },
      { title: 'E-Office (J&K Govt)', url: 'https://eoffice.jk.gov.in/', category: 'Employees Corner', subtitle: 'Electronic Office & File Approvals' },
      { title: 'JKHRMS Portal', url: 'https://hrms.jk.gov.in/', category: 'Employees Corner', subtitle: 'Human Resource Management & Leaves' },
      { title: 'EETMS Legal Tracking', url: 'https://law.pmgatishakti.gov.in/EETMS/login', category: 'Employees Corner', subtitle: 'Legal Cases & Efficiency Tracking' },
      { title: 'BG Management', url: 'https://bg.jkspdc.in/', category: 'Employees Corner', subtitle: 'Bank Guarantee Verification Portal' },
      { title: 'Asset Management Portal', url: 'https://jkspdc.inrdeals.in/login', category: 'Employees Corner', subtitle: 'Fixed Asset & Inventory Login' },
      { title: 'JKSPDC RAS Portal', url: 'https://janparichay.meripehchaan.gov.in/v1/pehchaan/login.html?service=passive&active=true&rm_5=false&continue=https%3A%2F%2Fjan_com%2Fmail%2F&pp=1&scc=1&lmpl=default&ltmplcache=2&emr=1&osid=1&flowName=GlifWebSignIn&flowEntry=ServiceLogin&sid=JanSugamJK&v=2.0&lang=&urlid=82ae2068-ada6-4154-ae21-649b90598534', category: 'Employees Corner', subtitle: 'JanParichay / MeriPehchaan Single Sign-On Portal' },
    ];

    if (raw.includes('employee') || raw.includes('cornor') || raw.includes('corner') || raw.includes('link') || raw.includes('portal') || raw.includes('mail') || raw.includes('hrms') || raw.includes('eoffice') || raw.includes('asset') || raw.includes('ras') || raw.includes('janparichay') || raw.includes('pehchaan')) {
      for (const el of employeeLinks) {
        if (el.title.toLowerCase().includes(raw) || el.subtitle.toLowerCase().includes(raw) || raw.includes('employee') || raw.includes('link')) {
          addSuggestion({ ...el, type: 'portal' });
        }
      }
    }

    // 2. Search Static Website Pages & Modules
    for (const page of this.pageCrawler.corePages) {
      const matchTitle = page.title.toLowerCase().includes(raw);
      const matchKeywords = page.keywords?.some((k: string) => k.toLowerCase().includes(raw) || raw.includes(k.toLowerCase()));
      const matchCategory = page.category.toLowerCase().includes(raw);

      if (matchTitle || matchKeywords || matchCategory) {
        addSuggestion({
          title: page.title,
          url: page.url,
          category: page.category,
          type: 'page',
          subtitle: `Explore ${page.category}`,
        });
      }
    }

    // 3. Search Power Stations (Live DB)
    try {
      const stations = await this.prisma.powerStation.findMany({
        where: {
          OR: [
            { name: { contains: raw } },
            { location: { contains: raw } },
            { type: { contains: raw } },
            { basin: { contains: raw } },
          ],
        },
        take: 4,
      });

      for (const st of stations) {
        addSuggestion({
          title: `${st.name} (${st.capacityMw} MW)`,
          url: `/our-business/power-station-details?id=${st.id}`,
          category: 'Power Stations',
          type: 'station',
          subtitle: `${st.type} | ${st.location || 'J&K'} | ${st.status}`,
        });
      }
    } catch (e) {}

    // 4. Search Tenders (Live DB)
    try {
      const tenders = await this.prisma.tender.findMany({
        where: {
          OR: [
            { title: { contains: raw } },
            { referenceNo: { contains: raw } },
            { workCategory: { contains: raw } },
          ],
        },
        take: 3,
      });

      for (const t of tenders) {
        addSuggestion({
          title: `${t.referenceNo} — ${t.title}`,
          url: `/stakeholders/vendors/tender-details?id=${t.id}`,
          category: 'Tenders & Bids',
          type: 'tender',
          subtitle: `Status: ${t.status} | Closing: ${t.closingDate ? new Date(t.closingDate).toLocaleDateString('en-IN') : 'Active'}`,
        });
      }
    } catch (e) {}

    return suggestions;
  }

  /**
   * User feedback recording.
   */
  async handleFeedback(dto: HydroFeedbackDto): Promise<{ success: boolean }> {
    const success = await this.analyticsService.recordFeedback(
      dto.conversationId,
      dto.rating,
      dto.feedbackText,
    );
    return { success };
  }

  /**
   * Trigger knowledge ingestion.
   */
  async triggerIngestion() {
    return this.ingestionService.runFullIngestion();
  }

  /**
   * Get administrative status of HYDRO.
   */
  async getAdminStatus(): Promise<HydroAdminStatus> {
    const totalDocuments = await this.prisma.hydroDocument.count();
    const totalChunks = await this.prisma.hydroChunk.count();
    const totalConversations = await this.prisma.hydroConversation.count();
    const ingestionStatus = this.ingestionService.getStatus();

    return {
      totalDocuments,
      totalChunks,
      totalConversations,
      lastIngestionAt: ingestionStatus.lastIngestedAt?.toISOString(),
      lastIngestionStatus: ingestionStatus.isIngesting ? 'running' : 'idle',
      indexHealth: totalChunks > 0 ? 'healthy' : 'empty',
      vectorIndexSize: this.vectorStore.size,
    };
  }

  /**
   * Fallback rule-based answer synthesis directly from retrieved evidence.
   */
  private generateDirectEvidenceAnswer(_query: string, chunks: any[]): string {
    if (!chunks || chunks.length === 0) {
      return INSUFFICIENT_EVIDENCE_RESPONSE;
    }

    const primaryChunk = chunks[0];
    return `According to official information published on the JKSPDCL website:\n\n${primaryChunk.content.trim()}`;
  }

  private getDefaultSuggestions(): string[] {
    return [
      "What is the total capacity of Baglihar HEP?",
      "Show me active tenders and deadlines",
      "What is the GSTIN of JKSPDCL?",
      "Who are the Board of Directors?",
      "Explain the CSR policy",
    ];
  }

  private generateFollowUpSuggestions(query: string): string[] {
    const lower = query.toLowerCase();
    if (lower.includes('baglihar') || lower.includes('bhep')) {
      return [
        "What is the design energy of Baglihar Stage-II?",
        "Where is Baglihar located?",
        "Show other power stations",
      ];
    }
    if (lower.includes('tender') || lower.includes('nit')) {
      return [
        "Are MSMEs exempt from EMD?",
        "How can I download tender documents?",
        "What are the latest notifications?",
      ];
    }
    return this.getDefaultSuggestions().slice(0, 3);
  }
}
