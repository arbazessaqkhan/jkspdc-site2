import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ChunkerService } from './chunker.service';
import { EmbeddingService } from '../services/embedding.service';
import { VectorStoreService } from '../services/vector-store.service';
import * as crypto from 'crypto';

/**
 * Database Indexer Service — Synchronizes structured database records (PowerStations, Tenders,
 * Directors, Notifications, Careers, Policies) into HydroDocuments and Vector Index chunks.
 */
@Injectable()
export class DatabaseIndexerService {
  private readonly logger = new Logger(DatabaseIndexerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chunker: ChunkerService,
    private readonly embedding: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  /**
   * Indexes all structured data tables into the knowledge base.
   */
  async indexAllDatabaseRecords(): Promise<{ indexedCount: number; chunkCount: number }> {
    let indexedCount = 0;
    let chunkCount = 0;

    // 1. Power Stations
    const stations = await this.prisma.powerStation.findMany();
    for (const station of stations) {
      const content = `### Power Station: ${station.name}\n\n` +
        `- **Installed Capacity:** ${station.capacityMw} MW\n` +
        `- **Type:** ${station.type}\n` +
        `- **Status:** ${station.status}\n` +
        `- **Location / District:** ${station.location || 'UT of J&K'}\n` +
        (station.basin ? `- **River Basin:** ${station.basin}\n` : '') +
        (station.configuration ? `- **Unit Configuration:** ${station.configuration}\n` : '') +
        (station.designEnergy ? `- **Design Energy Output:** ${station.designEnergy} MU (Million Units)\n` : '') +
        (station.yearOfCommissioning ? `- **Commissioning Year:** ${station.yearOfCommissioning}\n` : '') +
        (station.sector ? `- **Sector:** ${station.sector}\n` : '') +
        (station.salientFeatures ? `\n**Salient Features:**\n${station.salientFeatures}\n` : '') +
        (station.description ? `\n**Overview:**\n${station.description}\n` : '');

      const doc = await this.upsertDocument({
        title: `Power Station: ${station.name}`,
        sourceUrl: `/our-business/power-station-details?id=${station.id}`,
        sourceType: 'database',
        documentType: 'power_station',
        content,
      });

      if (doc) {
        indexedCount++;
        chunkCount += doc.chunkCount;
      }
    }

    // 2. Active Tenders
    const tenders = await this.prisma.tender.findMany({ where: { status: 'Active' } });
    for (const tender of tenders) {
      const content = `### Notice Inviting Tender: ${tender.title}\n\n` +
        `- **Tender Reference No:** ${tender.referenceNo}\n` +
        `- **Document Type:** ${tender.documentType}\n` +
        `- **Work Category:** ${tender.workCategory}\n` +
        `- **Location Tag:** ${tender.locationTag}\n` +
        `- **Status:** ${tender.status}\n` +
        `- **Publish Date:** ${tender.publishDate ? new Date(tender.publishDate).toLocaleDateString('en-IN') : 'N/A'}\n` +
        (tender.closingDate ? `- **Submission Deadline / Closing Date:** ${new Date(tender.closingDate).toLocaleDateString('en-IN')}\n` : '') +
        (tender.bidOpeningDate ? `- **Bid Opening Date:** ${new Date(tender.bidOpeningDate).toLocaleDateString('en-IN')}\n` : '') +
        (tender.description ? `\n**Description / Scope of Work:**\n${tender.description}\n` : '') +
        (tender.corrigendums ? `\n**Corrigenda Issued:**\n${tender.corrigendums}\n` : '');

      const doc = await this.upsertDocument({
        title: `Tender: ${tender.referenceNo} — ${tender.title}`,
        sourceUrl: `/stakeholders/vendors/tender-details?id=${tender.id}`,
        sourceType: 'database',
        documentType: 'tender',
        documentNumber: tender.referenceNo,
        publicationDate: tender.publishDate,
        content,
      });

      if (doc) {
        indexedCount++;
        chunkCount += doc.chunkCount;
      }
    }

    // 3. Board of Directors
    const directors = await this.prisma.director.findMany({ orderBy: { sNo: 'asc' } });
    if (directors.length > 0) {
      const directorText = directors
        .map((d, i) => `${i + 1}. **${d.name}** — ${d.position} (${d.role})${d.description ? `\n   ${d.description}` : ''}`)
        .join('\n\n');

      const content = `### JKSPDC Board of Directors & Corporate Leadership\n\n${directorText}`;

      const doc = await this.upsertDocument({
        title: 'Board of Directors & Governance',
        sourceUrl: '/about-us/management/board',
        sourceType: 'database',
        documentType: 'governance',
        content,
      });

      if (doc) {
        indexedCount++;
        chunkCount += doc.chunkCount;
      }
    }

    // 4. Notifications
    const notifs = await this.prisma.notification.findMany({ orderBy: { publishDate: 'desc' } });
    for (const notif of notifs) {
      const content = `### Official Notification: ${notif.title}\n\n` +
        `- **Document / File:** ${notif.fileName}\n` +
        `- **Publication Date:** ${new Date(notif.publishDate).toLocaleDateString('en-IN')}\n`;

      const doc = await this.upsertDocument({
        title: `Notification: ${notif.title}`,
        sourceUrl: notif.documentUrl || '/notifications',
        sourceType: 'database',
        documentType: 'notification',
        publicationDate: notif.publishDate,
        content,
      });

      if (doc) {
        indexedCount++;
        chunkCount += doc.chunkCount;
      }
    }

    // 5. Careers
    const careers = await this.prisma.career.findMany();
    for (const career of careers) {
      const content = `### Career & Recruitment Notice: ${career.title}\n\n` +
        `- **Advertisement No:** ${career.advertisementNo}\n` +
        `- **Status:** ${career.status}\n` +
        `- **Publish Date:** ${new Date(career.publishDate).toLocaleDateString('en-IN')}\n` +
        `- **Closing Date:** ${new Date(career.closingDate).toLocaleDateString('en-IN')}\n` +
        (career.description ? `\n**Details:**\n${career.description}\n` : '');

      const doc = await this.upsertDocument({
        title: `Career Opening: ${career.title}`,
        sourceUrl: '/stakeholders/career-seekers/current-openings',
        sourceType: 'database',
        documentType: 'career',
        documentNumber: career.advertisementNo,
        publicationDate: career.publishDate,
        content,
      });

      if (doc) {
        indexedCount++;
        chunkCount += doc.chunkCount;
      }
    }

    // 6. Corporate Policies
    const policies = await this.prisma.policyDocument.findMany();
    for (const policy of policies) {
      const content = `### Corporate Policy: ${policy.title}\n\n` +
        `- **Category:** ${policy.category}\n` +
        `- **Status:** ${policy.status}\n` +
        (policy.description ? `\n**Summary:**\n${policy.description}\n` : '');

      const doc = await this.upsertDocument({
        title: `Policy: ${policy.title}`,
        sourceUrl: '/about-us/explore/policies',
        sourceType: 'database',
        documentType: 'policy',
        category: policy.category,
        content,
      });

      if (doc) {
        indexedCount++;
        chunkCount += doc.chunkCount;
      }
    }

    // Save vector index to disk
    await this.vectorStore.saveIndex();

    this.logger.log(`Database records indexed: ${indexedCount} documents, ${chunkCount} chunks generated.`);
    return { indexedCount, chunkCount };
  }

  private async upsertDocument(params: {
    title: string;
    sourceUrl?: string;
    sourceType: string;
    documentType?: string;
    category?: string;
    documentNumber?: string;
    publicationDate?: Date;
    content: string;
  }): Promise<{ docId: string; chunkCount: number } | null> {
    try {
      const contentHash = crypto.createHash('sha256').update(params.content).digest('hex');

      // Check if document already exists with identical hash
      const existing = await this.prisma.hydroDocument.findFirst({
        where: { title: params.title, sourceType: params.sourceType },
      });

      if (existing && existing.contentHash === contentHash) {
        return null; // Up-to-date, skip
      }

      // If existing but changed, delete old chunks and vector store entries
      if (existing) {
        this.vectorStore.removeByDocumentId(existing.id);
        await this.prisma.hydroChunk.deleteMany({ where: { documentId: existing.id } });
      }

      const doc = existing
        ? await this.prisma.hydroDocument.update({
            where: { id: existing.id },
            data: {
              contentHash,
              sourceUrl: params.sourceUrl,
              documentType: params.documentType,
              category: params.category,
              documentNumber: params.documentNumber,
              publicationDate: params.publicationDate,
              lastUpdated: new Date(),
            },
          })
        : await this.prisma.hydroDocument.create({
            data: {
              title: params.title,
              sourceUrl: params.sourceUrl,
              sourceType: params.sourceType,
              documentType: params.documentType,
              category: params.category,
              documentNumber: params.documentNumber,
              publicationDate: params.publicationDate,
              contentHash,
            },
          });

      // Generate chunks
      const chunkItems = this.chunker.chunkText(params.content, params.title);

      // Embed chunks
      const embeddings = await this.embedding.embedBatch(chunkItems.map(c => c.content));

      for (let i = 0; i < chunkItems.length; i++) {
        const item = chunkItems[i];
        const emb = embeddings[i];

        const chunkRecord = await this.prisma.hydroChunk.create({
          data: {
            documentId: doc.id,
            chunkIndex: item.chunkIndex,
            content: item.content,
            heading: item.heading,
            sectionRef: item.sectionRef,
            pageNumber: item.pageNumber,
          },
        });

        if (emb) {
          this.vectorStore.addVector(chunkRecord.id, emb, {
            id: chunkRecord.id,
            documentId: doc.id,
            chunkIndex: item.chunkIndex,
            heading: item.heading,
          });
        }
      }

      return { docId: doc.id, chunkCount: chunkItems.length };
    } catch (err: any) {
      this.logger.error(`Failed to upsert document ${params.title}: ${err.message}`);
      return null;
    }
  }
}
