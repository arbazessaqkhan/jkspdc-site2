import { Injectable } from '@nestjs/common';

export interface ChunkResult {
  chunkIndex: number;
  content: string;
  heading?: string;
  sectionRef?: string;
  pageNumber?: number;
}

/**
 * Chunker Service — Intelligent semantic document chunker.
 * Splits documents by sections, headings, paragraphs, and numbered clauses.
 */
@Injectable()
export class ChunkerService {
  private readonly targetChunkSize = 800; // characters

  /**
   * Chunks plain text or markdown by headings and paragraphs.
   */
  chunkText(text: string, defaultHeading?: string): ChunkResult[] {
    if (!text || text.trim().length === 0) return [];

    const clean = text.replace(/\r\n/g, '\n').trim();

    // 1. Split by Markdown headings (###, ##, #)
    const sectionRegex = /(?:^|\n)(#{1,4}\s+[^\n]+)/g;
    const sections: Array<{ heading: string; body: string }> = [];

    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let currentHeading = defaultHeading || 'Overview';

    while ((match = sectionRegex.exec(clean)) !== null) {
      if (match.index > lastIndex) {
        const body = clean.substring(lastIndex, match.index).trim();
        if (body) {
          sections.push({ heading: currentHeading, body });
        }
      }
      currentHeading = match[1].replace(/^#+\s*/, '').trim();
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < clean.length) {
      const body = clean.substring(lastIndex).trim();
      if (body) {
        sections.push({ heading: currentHeading, body });
      }
    }

    if (sections.length === 0) {
      sections.push({ heading: defaultHeading || 'General', body: clean });
    }

    // 2. Subdivide each section into manageable chunks with overlap
    const chunks: ChunkResult[] = [];
    let chunkIndex = 0;

    for (const sec of sections) {
      const paragraphs = sec.body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      let currentChunk = '';

      for (const p of paragraphs) {
        if ((currentChunk.length + p.length) > this.targetChunkSize && currentChunk.length > 0) {
          chunks.push({
            chunkIndex: chunkIndex++,
            content: currentChunk.trim(),
            heading: sec.heading,
          });
          const words = currentChunk.split(/\s+/);
          const overlap = words.slice(-Math.min(words.length, 25)).join(' ');
          currentChunk = overlap + '\n\n' + p;
        } else {
          currentChunk = currentChunk ? `${currentChunk}\n\n${p}` : p;
        }
      }

      if (currentChunk.trim().length > 0) {
        chunks.push({
          chunkIndex: chunkIndex++,
          content: currentChunk.trim(),
          heading: sec.heading,
        });
      }
    }

    return chunks;
  }
}
