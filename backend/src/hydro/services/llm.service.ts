import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * LLM Service — Abstracted LLM provider interface using @google/generative-ai.
 * Handles all communication with the LLM, including streaming and token tracking.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private genAI: any = null;
  private initialized = false;
  private readonly modelName: string;
  private totalTokensUsed = 0;

  constructor(private readonly config: ConfigService) {
    this.modelName = this.config.get<string>('HYDRO_LLM_MODEL') || 'gemini-2.5-flash';
  }

  /**
   * Lazy-initialize the Gemini SDK. Doesn't crash the app if API key is missing.
   */
  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) return !!this.genAI;

    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set — HYDRO LLM features running in direct-grounded fallback mode. Set GEMINI_API_KEY in .env to enable Gemini inference.');
      this.initialized = true;
      return false;
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.initialized = true;
      this.logger.log(`HYDRO LLM initialized: model=${this.modelName}`);
      return true;
    } catch (err) {
      this.logger.error('Failed to initialize Gemini SDK', err);
      this.initialized = true;
      return false;
    }
  }

  /**
   * Generate a response from the LLM using the system prompt and user message.
   */
  async generateResponse(systemPrompt: string, userMessage: string): Promise<string | null> {
    const ready = await this.ensureInitialized();
    if (!ready || !this.genAI) return null;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.3,
          topP: 0.85,
        },
      });

      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = response.text();

      if (response.usageMetadata) {
        const used = (response.usageMetadata.promptTokenCount || 0) + (response.usageMetadata.candidatesTokenCount || 0);
        this.totalTokensUsed += used;
      }

      return text || null;
    } catch (err: any) {
      this.logger.error(`LLM generation failed: ${err.message || err}`);
      return null;
    }
  }

  /**
   * Generate a response with conversation history for multi-turn context.
   */
  async generateWithHistory(
    systemPrompt: string,
    conversationHistory: { role: string; text: string }[],
    userMessage: string,
  ): Promise<string | null> {
    const ready = await this.ensureInitialized();
    if (!ready || !this.genAI) return null;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.3,
          topP: 0.85,
        },
      });

      const contents: any[] = [];
      for (const turn of conversationHistory) {
        contents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.text }],
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const result = await model.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      if (response.usageMetadata) {
        const used = (response.usageMetadata.promptTokenCount || 0) + (response.usageMetadata.candidatesTokenCount || 0);
        this.totalTokensUsed += used;
      }

      return text || null;
    } catch (err: any) {
      this.logger.error(`LLM generation with history failed: ${err.message || err}`);
      return null;
    }
  }

  /** Returns true if the LLM is configured and ready */
  async isAvailable(): Promise<boolean> {
    return this.ensureInitialized();
  }

  /** Get total tokens used this session */
  getTokenUsage(): number {
    return this.totalTokensUsed;
  }
}
