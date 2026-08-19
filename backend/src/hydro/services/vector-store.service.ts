import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface VectorEntry {
  id: string;
  documentId: string;
  chunkIndex: number;
  heading?: string;
  metadata?: string;
}

export interface VectorSearchResult {
  id: string;
  documentId: string;
  chunkIndex: number;
  heading?: string;
  metadata?: string;
  score: number; // cosine similarity 0..1
}

/**
 * Vector Store Service — In-process vector index for semantic search.
 * Uses a simple brute-force cosine similarity search (pure JS, no native deps).
 * Suitable for up to ~50,000 vectors. For larger scale, swap in pgvector.
 */
@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private vectors: Map<string, { embedding: number[]; entry: VectorEntry }> = new Map();
  private readonly indexPath: string;
  private dirty = false;

  constructor(private readonly config: ConfigService) {
    this.indexPath = this.config.get<string>('HYDRO_VECTOR_INDEX_PATH')
      || path.join(process.cwd(), 'data', 'hydro-vectors.json');
    this.loadIndex();
  }

  /**
   * Add a vector to the index.
   */
  addVector(id: string, embedding: number[], entry: VectorEntry): void {
    this.vectors.set(id, { embedding, entry });
    this.dirty = true;
  }

  /**
   * Remove all vectors for a given document.
   */
  removeByDocumentId(documentId: string): number {
    let removed = 0;
    for (const [key, val] of this.vectors.entries()) {
      if (val.entry.documentId === documentId) {
        this.vectors.delete(key);
        removed++;
      }
    }
    if (removed > 0) this.dirty = true;
    return removed;
  }

  /**
   * Search for the top-K most similar vectors to the query embedding.
   */
  search(queryEmbedding: number[], topK: number = 5, filter?: { documentIds?: string[] }): VectorSearchResult[] {
    if (this.vectors.size === 0 || !queryEmbedding || queryEmbedding.length === 0) {
      return [];
    }

    const results: VectorSearchResult[] = [];

    for (const [, { embedding, entry }] of this.vectors) {
      // Optional filter
      if (filter?.documentIds && !filter.documentIds.includes(entry.documentId)) {
        continue;
      }

      const score = this.cosineSimilarity(queryEmbedding, embedding);
      if (score > 0.1) { // minimum relevance threshold
        results.push({
          id: entry.id,
          documentId: entry.documentId,
          chunkIndex: entry.chunkIndex,
          heading: entry.heading,
          metadata: entry.metadata,
          score,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Persist the index to disk.
   */
  async saveIndex(): Promise<void> {
    if (!this.dirty) return;

    try {
      const dir = path.dirname(this.indexPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const serializable: any[] = [];
      for (const [key, val] of this.vectors) {
        serializable.push({
          key,
          embedding: val.embedding,
          entry: val.entry,
        });
      }

      fs.writeFileSync(this.indexPath, JSON.stringify(serializable), 'utf-8');
      this.dirty = false;
      this.logger.log(`Vector index saved: ${serializable.length} vectors → ${this.indexPath}`);
    } catch (err: any) {
      this.logger.error(`Failed to save vector index: ${err.message}`);
    }
  }

  /**
   * Load the index from disk.
   */
  private loadIndex(): void {
    try {
      if (fs.existsSync(this.indexPath)) {
        const data = JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
        for (const item of data) {
          this.vectors.set(item.key, {
            embedding: item.embedding,
            entry: item.entry,
          });
        }
        this.logger.log(`Vector index loaded: ${this.vectors.size} vectors from ${this.indexPath}`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not load vector index: ${err.message}`);
    }
  }

  /**
   * Clear the entire index.
   */
  clear(): void {
    this.vectors.clear();
    this.dirty = true;
  }

  /** Get the number of indexed vectors */
  get size(): number {
    return this.vectors.size;
  }

  /**
   * Cosine similarity between two vectors.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}
