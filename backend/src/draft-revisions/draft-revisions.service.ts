import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DraftRevisionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllDraftRevisions() {
    const revisions = await this.prisma.draftRevision.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return revisions.map((r) => {
      let parsed: any = {};
      try {
        parsed = JSON.parse(r.draftData);
      } catch {
        parsed = r.draftData;
      }
      return {
        ...r,
        draftData: parsed,
      };
    });
  }

  async getDraftRevision(entityType: string, entityId: string) {
    const revision = await this.prisma.draftRevision.findUnique({
      where: {
        entityType_entityId: {
          entityType: entityType.toLowerCase(),
          entityId,
        },
      },
    });
    if (!revision) {
      return null;
    }
    let parsedData = {};
    try {
      parsedData = JSON.parse(revision.draftData);
    } catch {
      parsedData = revision.draftData;
    }
    return {
      ...revision,
      draftData: parsedData,
    };
  }

  async saveDraftRevision(entityType: string, entityId: string, draftData: any) {
    const serialized = typeof draftData === 'string' ? draftData : JSON.stringify(draftData);
    const revision = await this.prisma.draftRevision.upsert({
      where: {
        entityType_entityId: {
          entityType: entityType.toLowerCase(),
          entityId,
        },
      },
      create: {
        entityType: entityType.toLowerCase(),
        entityId,
        draftData: serialized,
      },
      update: {
        draftData: serialized,
      },
    });
    return revision;
  }

  async deleteDraftRevision(entityType: string, entityId: string) {
    await this.prisma.draftRevision.deleteMany({
      where: {
        entityType: entityType.toLowerCase(),
        entityId,
      },
    });
    return { success: true };
  }
}
