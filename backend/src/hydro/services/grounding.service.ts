import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RetrievedChunk } from './retrieval.service';

/**
 * Grounding Service — Evaluates evidence confidence, validates factual grounding,
 * and extracts verifiable source citations.
 */
@Injectable()
export class GroundingService {
  private readonly highConfidenceThreshold: number;
  private readonly mediumConfidenceThreshold: number;

  constructor(private readonly config: ConfigService) {
    this.highConfidenceThreshold = parseFloat(this.config.get<string>('HYDRO_CONFIDENCE_HIGH') || '0.70');
    this.mediumConfidenceThreshold = parseFloat(this.config.get<string>('HYDRO_CONFIDENCE_MEDIUM') || '0.40');
  }

  /**
   * Evaluates the confidence score of retrieved evidence.
   */
  evaluateConfidence(chunks: RetrievedChunk[]): 'high' | 'medium' | 'low' {
    if (!chunks || chunks.length === 0) return 'low';

    if (chunks.some(c => c.searchType === 'override' || (c.searchType === 'database' && c.score >= 0.8))) {
      return 'high';
    }

    const topScore = chunks[0].score;

    if (topScore >= this.highConfidenceThreshold) {
      return 'high';
    } else if (topScore >= this.mediumConfidenceThreshold) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Formats retrieved chunks into clean context text for LLM injection.
   */
  formatContext(chunks: RetrievedChunk[]): string {
    if (!chunks || chunks.length === 0) {
      return 'NO APPROVED WEBSITE EVIDENCE RETRIEVED.';
    }

    return chunks
      .map((c, i) => {
        const sourceHeader = `[DOCUMENT ${i + 1}: ${c.title}]` +
          (c.sourceUrl ? ` (URL: ${c.sourceUrl})` : '') +
          (c.sectionRef ? ` (Section: ${c.sectionRef})` : '') +
          (c.pageNumber ? ` (Page: ${c.pageNumber})` : '');
        return `${sourceHeader}\n${c.content.trim()}`;
      })
      .join('\n\n---\n\n');
  }

  /**
   * Assembles citations from retrieved chunks.
   */
  extractCitations(chunks: RetrievedChunk[]): Array<{ title: string; url?: string; documentType?: string; pageNumber?: number; sectionRef?: string }> {
    const seen = new Set<string>();
    const citations: Array<{ title: string; url?: string; documentType?: string; pageNumber?: number; sectionRef?: string }> = [];

    for (const chunk of chunks) {
      const key = `${chunk.title}_${chunk.sourceUrl || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        citations.push({
          title: chunk.title,
          url: chunk.sourceUrl,
          documentType: chunk.documentType,
          pageNumber: chunk.pageNumber,
          sectionRef: chunk.sectionRef,
        });
      }
    }

    return citations;
  }
}
