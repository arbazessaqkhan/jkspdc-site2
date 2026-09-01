import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseIndexerService } from './database-indexer.service';
import { PageCrawlerService } from './page-crawler.service';
import { PrismaService } from '../../prisma.service';

/**
 * Ingestion Service — Master knowledge ingestion orchestrator.
 * Auto-triggers initial indexing on application startup if knowledge base is empty.
 */
@Injectable()
export class IngestionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(IngestionService.name);
  private isIngesting = false;
  private lastIngestedAt: Date | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly dbIndexer: DatabaseIndexerService,
    private readonly pageCrawler: PageCrawlerService,
  ) {}

  /**
   * Auto-index knowledge on bootstrap if empty.
   */
  async onApplicationBootstrap() {
    try {
      const docCount = await this.prisma.hydroDocument.count();
      if (docCount === 0) {
        this.logger.log('HYDRO Knowledge Base is empty. Triggering initial ingestion...');
        await this.runFullIngestion();
      } else {
        this.logger.log(`HYDRO Knowledge Base initialized with ${docCount} existing documents.`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not check initial HYDRO knowledge count: ${err.message}`);
    }
  }

  /**
   * Runs full ingestion across all database records and approved website pages.
   */
  async runFullIngestion(): Promise<{ success: boolean; documentsIndexed: number; chunksCreated: number; durationMs: number }> {
    if (this.isIngesting) {
      throw new Error('An ingestion job is already running in background.');
    }

    this.isIngesting = true;
    const startTime = Date.now();
    let totalDocs = 0;
    let totalChunks = 0;

    try {
      this.logger.log('Starting full HYDRO knowledge ingestion...');

      // 1. Index database records
      const dbResult = await this.dbIndexer.indexAllDatabaseRecords();
      totalDocs += dbResult.indexedCount;
      totalChunks += dbResult.chunkCount;

      // 2. Index core website pages
      const pageResult = await this.pageCrawler.indexCorePages();
      totalDocs += pageResult.indexedPages;
      totalChunks += pageResult.totalChunks;

      const durationMs = Date.now() - startTime;
      this.lastIngestedAt = new Date();

      await this.prisma.hydroIngestionLog.create({
        data: {
          sourceType: 'full_sync',
          status: 'success',
          chunksCreated: totalChunks,
          durationMs,
        },
      });

      this.logger.log(`HYDRO Knowledge Ingestion complete: ${totalDocs} documents, ${totalChunks} chunks in ${durationMs}ms.`);
      return { success: true, documentsIndexed: totalDocs, chunksCreated: totalChunks, durationMs };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      this.logger.error(`HYDRO Knowledge Ingestion failed: ${err.message}`, err.stack);

      await this.prisma.hydroIngestionLog.create({
        data: {
          sourceType: 'full_sync',
          status: 'failed',
          errorMessage: err.message,
          durationMs,
        },
      });

      return { success: false, documentsIndexed: totalDocs, chunksCreated: totalChunks, durationMs };
    } finally {
      this.isIngesting = false;
    }
  }

  getStatus() {
    return {
      isIngesting: this.isIngesting,
      lastIngestedAt: this.lastIngestedAt,
    };
  }
}
