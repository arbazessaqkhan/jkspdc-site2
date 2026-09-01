import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

/**
 * Conversation Service — Manages multi-turn session conversational memory.
 * Stores recent dialogue turns in memory with automatic expiration to preserve privacy.
 */
@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private readonly sessions = new Map<string, ConversationTurn[]>();
  private readonly maxTurns: number;
  private readonly ttlMs: number = 30 * 60 * 1000; // 30 mins TTL

  constructor(private readonly config: ConfigService) {
    this.maxTurns = parseInt(this.config.get<string>('HYDRO_MAX_CONVERSATION_TURNS') || '10', 10);

    // Periodic cleanup of expired sessions
    setInterval(() => this.cleanupExpired(), 10 * 60 * 1000);
  }

  /**
   * Retrieves conversation history for a session.
   */
  getHistory(sessionId: string): ConversationTurn[] {
    if (!sessionId) return [];
    return this.sessions.get(sessionId) || [];
  }

  /**
   * Appends user message and bot response to session history.
   */
  addTurn(sessionId: string, userMessage: string, botResponse: string): void {
    if (!sessionId) return;

    let turns = this.sessions.get(sessionId) || [];
    const now = Date.now();

    turns.push({ role: 'user', text: userMessage, timestamp: now });
    turns.push({ role: 'assistant', text: botResponse, timestamp: now });

    // Keep only last N turns
    if (turns.length > this.maxTurns * 2) {
      turns = turns.slice(-this.maxTurns * 2);
    }

    this.sessions.set(sessionId, turns);
  }

  /**
   * Formats conversation history into a readable prompt string.
   */
  formatHistoryForPrompt(sessionId?: string, clientHistory?: Array<{ role: 'user' | 'assistant'; text: string }>): string {
    let history: Array<{ role: 'user' | 'assistant'; text: string }> = [];

    if (sessionId && this.sessions.has(sessionId)) {
      history = this.sessions.get(sessionId)!;
    } else if (clientHistory && Array.isArray(clientHistory) && clientHistory.length > 0) {
      history = clientHistory.slice(-this.maxTurns * 2);
    }

    if (history.length === 0) {
      return 'No previous conversation turns.';
    }

    return history
      .map(t => `${t.role === 'user' ? 'User' : 'HYDRO'}: ${t.text}`)
      .join('\n');
  }

  /**
   * Clears a session.
   */
  clearSession(sessionId: string): void {
    if (sessionId) {
      this.sessions.delete(sessionId);
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, turns] of this.sessions.entries()) {
      const lastTurn = turns[turns.length - 1];
      if (lastTurn && (now - lastTurn.timestamp) > this.ttlMs) {
        this.sessions.delete(id);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired HYDRO chat sessions.`);
    }
  }
}
