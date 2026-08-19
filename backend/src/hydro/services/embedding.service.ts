import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Embedding Service — Generates vector embeddings using Google's text-embedding model via @google/generative-ai.
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private genAI: any = null;
  private initialized = false;
  private readonly modelName: string;
  readonly dimensions = 768;

  constructor(private readonly config: ConfigService) {
    this.modelName = this.config.get<string>('HYDRO_EMBEDDING_MODEL') || 'text-embedding-004';
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) return !!this.genAI;

    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.initialized = true;
      return false;
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.initialized = true;
      this.logger.log(`HYDRO Embedding service initialized: model=${this.modelName}`);
      return true;
    } catch (err) {
      this.logger.error('Failed to initialize embedding SDK', err);
      this.initialized = true;
      return false;
    }
  }

  /**
   * Generate an embedding for a single text query.
   */
  async embedQuery(text: string): Promise<number[] | null> {
    const ready = await this.ensureInitialized();
    if (!ready || !this.genAI) return null;

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.embedContent(text);
      return result.embedding.values || null;
    } catch (err: any) {
      this.logger.warn(`Embedding query failed: ${err.message || err}`);
      return null;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch.
   */
  async embedBatch(texts: string[]): Promise<(number[] | null)[]> {
    const ready = await this.ensureInitialized();
    if (!ready || !this.genAI) return texts.map(() => null);

    const results: (number[] | null)[] = [];
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await model.embedContent(texts[i]);
        results.push(result.embedding.values || null);
        // Small rate limit pause every 10 calls
        if (i % 10 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      } catch (err: any) {
        this.logger.warn(`Batch embedding failed for item ${i}: ${err.message}`);
        results.push(null);
      }
    }

    return results;
  }

  async isAvailable(): Promise<boolean> {
    return this.ensureInitialized();
  }
}
