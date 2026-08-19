import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

/**
 * Analytics Service — Logs user conversations, feedback, and aggregates metrics
 * without storing personal identity information.
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs a conversation turn for quality assessment.
   */
  async logConversation(params: {
    sessionId: string;
    userMessage: string;
    botResponse: string;
    confidence: string;
    category?: string;
    sourcesUsed?: any[];
    latencyMs: number;
    currentPage?: string;
  }): Promise<string | null> {
    try {
      const record = await this.prisma.hydroConversation.create({
        data: {
          sessionId: params.sessionId,
          userMessage: params.userMessage,
          botResponse: params.botResponse,
          confidence: params.confidence,
          category: params.category || this.categorizeQuery(params.userMessage),
          sourcesUsed: params.sourcesUsed ? JSON.stringify(params.sourcesUsed) : null,
          latencyMs: params.latencyMs,
          currentPage: params.currentPage || null,
        },
      });
      return record.id;
    } catch (err: any) {
      this.logger.warn(`Failed to log conversation: ${err.message}`);
      return null;
    }
  }

  /**
   * Records user feedback (thumbs up / down and optional comment).
   */
  async recordFeedback(conversationId: string, rating: number, feedbackText?: string): Promise<boolean> {
    try {
      await this.prisma.hydroConversation.update({
        where: { id: conversationId },
        data: {
          feedbackRating: rating,
          feedbackText: feedbackText || null,
        },
      });
      return true;
    } catch (err: any) {
      this.logger.warn(`Failed to record feedback for ${conversationId}: ${err.message}`);
      return false;
    }
  }

  /**
   * Retrieves analytics summary for administration dashboard.
   */
  async getAnalyticsSummary(): Promise<any> {
    try {
      const totalConversations = await this.prisma.hydroConversation.count();
      const positiveFeedback = await this.prisma.hydroConversation.count({ where: { feedbackRating: 1 } });
      const negativeFeedback = await this.prisma.hydroConversation.count({ where: { feedbackRating: -1 } });

      const recentConversations = await this.prisma.hydroConversation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return {
        totalConversations,
        positiveFeedback,
        negativeFeedback,
        satisfactionRate: (positiveFeedback + negativeFeedback) > 0
          ? Math.round((positiveFeedback / (positiveFeedback + negativeFeedback)) * 100)
          : 100,
        recentConversations,
      };
    } catch (err: any) {
      this.logger.error(`Failed to get analytics summary: ${err.message}`);
      return { totalConversations: 0, positiveFeedback: 0, negativeFeedback: 0, recentConversations: [] };
    }
  }

  private categorizeQuery(query: string): string {
    const lower = query.toLowerCase();
    if (/\b(tender|nit|enit|bid|bids|procurement)\b/i.test(lower)) return 'Tenders';
    if (/\b(project|station|hep|capacity|mw|baglihar)\b/i.test(lower)) return 'Projects';
    if (/\b(career|job|recruitment|vacancy)\b/i.test(lower)) return 'Careers';
    if (/\b(contact|phone|email|office|directory)\b/i.test(lower)) return 'Contact';
    if (/\b(policy|csr|ethics|rti)\b/i.test(lower)) return 'Policies & CSR';
    if (/\b(gst|gstin|tax|cin)\b/i.test(lower)) return 'Taxation';
    return 'General Website';
  }
}
