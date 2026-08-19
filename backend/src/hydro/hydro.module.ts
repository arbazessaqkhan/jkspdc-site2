import { Module } from '@nestjs/common';
import { HydroController } from './hydro.controller';
import { HydroService } from './services/hydro.service';
import { LlmService } from './services/llm.service';
import { EmbeddingService } from './services/embedding.service';
import { VectorStoreService } from './services/vector-store.service';
import { ScopeService } from './services/scope.service';
import { QueryService } from './services/query.service';
import { RetrievalService } from './services/retrieval.service';
import { GroundingService } from './services/grounding.service';
import { ConversationService } from './services/conversation.service';
import { CitationService } from './services/citation.service';
import { AnalyticsService } from './services/analytics.service';
import { ChunkerService } from './ingestion/chunker.service';
import { DocumentParserService } from './ingestion/document-parser.service';
import { DatabaseIndexerService } from './ingestion/database-indexer.service';
import { PageCrawlerService } from './ingestion/page-crawler.service';
import { IngestionService } from './ingestion/ingestion.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HydroController],
  providers: [
    PrismaService,
    LlmService,
    EmbeddingService,
    VectorStoreService,
    ScopeService,
    QueryService,
    RetrievalService,
    GroundingService,
    ConversationService,
    CitationService,
    AnalyticsService,
    ChunkerService,
    DocumentParserService,
    DatabaseIndexerService,
    PageCrawlerService,
    IngestionService,
    HydroService,
  ],
  exports: [HydroService, IngestionService],
})
export class HydroModule {}
