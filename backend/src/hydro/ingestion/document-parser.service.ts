import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

export interface ParsedDocument {
  title: string;
  text: string;
  metadata?: Record<string, any>;
}

/**
 * Document Parser Service — Extracts structured text from PDFs and HTML content.
 */
@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);

  /**
   * Parses a PDF file from a local filesystem path.
   */
  async parsePdf(filePath: string): Promise<ParsedDocument | null> {
    try {
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`File does not exist: ${filePath}`);
        return null;
      }

      const dataBuffer = fs.readFileSync(filePath);
      const pdfParseModule: any = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;

      const data = await (typeof pdfParse === 'function' ? pdfParse(dataBuffer) : { text: '', numpages: 1, info: {} });

      return {
        title: data.info?.Title || filePath.split(/[\/\\]/).pop() || 'PDF Document',
        text: data.text || '',
        metadata: {
          pages: data.numpages,
          info: data.info,
        },
      };
    } catch (err: any) {
      this.logger.error(`Failed to parse PDF ${filePath}: ${err.message}`);
      return null;
    }
  }

  /**
   * Parses HTML string to plain structured text by removing tags and preserving headings.
   */
  parseHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n## $1\n\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1')
      .replace(/<tr[^>]*>(.*?)<\/tr>/gi, '\n$1')
      .replace(/<td[^>]*>(.*?)<\/td>/gi, ' | $1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
