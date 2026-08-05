import { Injectable } from '@nestjs/common';

export interface KnowledgeChunk {
  id: string;
  module: string;
  title: string;
  routeUrl: string;
  keywords: string[];
  content: string;
}

export interface VectorSearchResult {
  chunk: KnowledgeChunk;
  similarity: number;
}

@Injectable()
export class VectorStoreService {
  /**
   * Calculates cosine similarity score between input query and knowledge chunk content
   */
  searchVectorSimilarity(query: string, chunks: KnowledgeChunk[], topK: number = 3): VectorSearchResult[] {
    if (!query || !chunks || chunks.length === 0) return [];
    
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const results: VectorSearchResult[] = [];

    for (const chunk of chunks) {
      const chunkText = `${chunk.title} ${chunk.keywords.join(' ')} ${chunk.content}`.toLowerCase();
      const chunkTokens = this.tokenize(chunkText);
      
      const similarity = this.calculateCosineSimilarity(queryTokens, chunkTokens, chunk.keywords, query);
      if (similarity > 0) {
        results.push({ chunk, similarity });
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length >= 2);
  }

  private calculateCosineSimilarity(queryTokens: string[], chunkTokens: string[], keywords: string[], rawQuery: string): number {
    const chunkTokenSet = new Set(chunkTokens);
    let matchCount = 0;

    for (const qt of queryTokens) {
      if (chunkTokenSet.has(qt)) {
        matchCount++;
      }
    }

    if (matchCount === 0) return 0;

    const queryMag = Math.sqrt(queryTokens.length);
    const chunkMag = Math.sqrt(chunkTokens.length);

    let baseScore = matchCount / (queryMag * chunkMag);

    // Keyword boost
    const lowerQuery = rawQuery.toLowerCase();
    for (const kw of keywords) {
      if (lowerQuery.includes(kw.toLowerCase())) {
        baseScore += 0.15;
      }
    }

    return baseScore;
  }
}
