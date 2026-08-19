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
