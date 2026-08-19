import { Injectable } from '@nestjs/common';
import { HydroSourceRef } from '../dto';

/**
 * Citation Service — Formats, validates, and builds verifiable source cards.
 */
@Injectable()
export class CitationService {
  /**
   * Formats a list of citation source references into markdown links and cards.
   */
  formatSourceCards(sources: HydroSourceRef[]): string {
    if (!sources || sources.length === 0) return '';

    const validSources = sources.filter(s => s.title);
    if (validSources.length === 0) return '';

    const lines = validSources.map(s => {
      let label = s.title;
      if (s.pageNumber) label += ` (Page ${s.pageNumber})`;
      if (s.sectionRef) label += ` — ${s.sectionRef}`;

      if (s.url) {
        return `- [${label}](${s.url})`;
      } else {
        return `- ${label}`;
      }
    });

    return `\n\n**Official Sources:**\n${lines.join('\n')}`;
  }
}
