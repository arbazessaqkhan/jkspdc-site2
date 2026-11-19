import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { detectFileFormat } from '../common/file-format.helper';

@Injectable()
export class PublicApiService {
  constructor(private readonly prisma: PrismaService) {}

  async getPowerStations() {
    return this.prisma.powerStation.findMany({
      orderBy: { capacityMw: 'desc' },
    });
  }

  async getActiveTenders() {
    return this.prisma.tender.findMany({
      where: { status: { in: ['Active', 'Archived'] } },
      orderBy: { publishDate: 'desc' },
    });
  }

  async getActiveCareers() {
    return this.prisma.career.findMany({
      where: { status: 'Active' },
      orderBy: { publishDate: 'desc' },
    });
  }

  async getPressReleases() {
    return this.prisma.pressRelease.findMany({
      orderBy: { publishDate: 'desc' },
    });
  }

  async getNotifications() {
    return this.prisma.notification.findMany({
      where: { status: { in: ['Active', 'Archived'] } },
      orderBy: { publishDate: 'desc' },
    });
  }

  async getAgmDocuments() {
    return this.prisma.agmDocument.findMany({
      orderBy: { meetingDate: 'desc' },
    });
  }

  async getSiteSetting(key: string) {
    const s = await this.prisma.siteSetting.findUnique({ where: { key } });
    return { key, value: s ? s.value : null };
  }

  /**
   * Derived homepage ticker feed.
   *
   * The ticker is never curated by hand. Exactly like the announcement bar on
   * other power-sector portals, it is derived from the live records: Tenders
   * (including the Corrigenda attached to them) and Notifications. Staff publish
   * a tender, a corrigendum or a notice once in its own admin screen and it
   * appears in the bar automatically while it is current - no separate ticker
   * module, no duplicate upload, no manual list to maintain.
   *
   * The single deliberate override is `Priority = Urgent`, which pins a record
   * to the front of the bar.
   *
   * At most five items are returned, ordered as:
   *   1. Urgent pins (newest first).
   *   2. Corrigenda uploaded in the last 72 hours (newest first).
   *   3. Items closing / valid till within 48 hours (soonest first).
   *   4. Everything else that is still current (newest first).
   *
   * Expired records (tender closing date passed, notification past its valid
   * till date) are never returned, so the bar empties itself as records age.
   */
  async getTicker() {
    const now = new Date();
    const HOUR_MS = 60 * 60 * 1000;
    const CORRIGENDUM_WINDOW_MS = 72 * HOUR_MS;
    const CLOSING_SOON_WINDOW_MS = 48 * HOUR_MS;
    const NEW_WINDOW_MS = 48 * HOUR_MS;
    const MAX_ITEMS = 5;

    let tenders: any[] = [];
    let notifications: any[] = [];
    try {
      [tenders, notifications] = await Promise.all([
        this.prisma.tender.findMany({
          where: { status: 'Active' },
          orderBy: { publishDate: 'desc' },
        }),
        this.prisma.notification.findMany({
          where: { status: 'Active' },
          orderBy: { publishDate: 'desc' },
        }),
      ]);
    } catch (e) {
      console.error('Error fetching ticker sources:', e);
      return { speed: 'Normal', autoplay: true, duration: 4, items: [] };
    }

    const toDate = (value?: Date | string | null): Date | null => {
      if (!value) return null;
      const d = value instanceof Date ? value : new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const isExpired = (expiry: Date | null): boolean =>
      !!expiry && expiry.getTime() < now.getTime();
    const newestFirst = (a: any, b: any): number =>
      b.publishDate.getTime() - a.publishDate.getTime();

    type Candidate = {
      id: string;
      sourceType: 'tender' | 'corrigendum' | 'notification';
      sourceId: string;
      title: string;
      referenceNo: string | null;
      url: string;
      fileUrl: string;
      fileFormat: string | null;
      fileSizeBytes: number | null;
      priority: string;
      publishDate: Date;
      closingDate: Date | null;
    };

    const candidates: Candidate[] = [];

    // Published tenders. Every active tender is a candidate. If a closing date
    // is set, expired records are filtered out automatically.
    for (const t of tenders) {
      const expiry = toDate(t.closingDate);
      if (expiry && isExpired(expiry)) continue;
      const isCorrigendum = t.documentType === 'CORRIGENDUM';
      candidates.push({
        id: `tender-${t.id}`,
        sourceType: isCorrigendum ? 'corrigendum' : 'tender',
        sourceId: t.id,
        title: t.title,
        referenceNo: t.referenceNo ?? null,
        url: `/stakeholders/vendors/tender-details?id=${t.id}`,
        fileUrl: t.documentUrl,
        fileFormat: t.fileFormat || detectFileFormat(t.documentUrl),
        fileSizeBytes: t.fileSizeBytes ?? null,
        priority: t.priority || 'Normal',
        publishDate: toDate(t.publishDate) || now,
        closingDate: expiry,
      });
    }

    // Corrigenda attached to a tender are announced as their own entry and link
    // back to the parent tender, so a bidder sees the original notice and every
    // amendment side by side.
    for (const t of tenders) {
      const parentExpiry = toDate(t.closingDate);

      let corrs: any[] = [];
      if (Array.isArray(t.corrigendums)) {
        corrs = t.corrigendums;
      } else if (typeof t.corrigendums === 'string' && t.corrigendums.trim()) {
        try {
          const parsed = JSON.parse(t.corrigendums);
          if (Array.isArray(parsed)) corrs = parsed;
        } catch {
          corrs = [];
        }
      }

      for (const corr of corrs) {
        if (!corr || typeof corr !== 'object') continue;
        const expiry = toDate(corr.extendedClosingDate) || parentExpiry;
        if (expiry && isExpired(expiry)) continue;
        const corrId = corr.id ?? `${t.id}-${corr.title ?? candidates.length}`;
        candidates.push({
          id: `corrigendum-${t.id}-${corrId}`,
          sourceType: 'corrigendum',
          sourceId: String(corrId),
          title: corr.title || `Corrigendum to ${t.title}`,
          referenceNo: t.referenceNo ?? null,
          url: `/stakeholders/vendors/tender-details?id=${t.id}#corrigendum-${corrId}`,
          fileUrl: corr.documentUrl || t.documentUrl,
          fileFormat:
            corr.fileFormat ||
            detectFileFormat(corr.documentUrl) ||
            t.fileFormat ||
            detectFileFormat(t.documentUrl),
          fileSizeBytes: corr.fileSizeBytes ?? null,
          priority: corr.priority || 'Normal',
          publishDate:
            toDate(corr.publishDate) || toDate(corr.uploadedAt) || toDate(t.publishDate) || now,
          closingDate: expiry,
        });
      }
    }

    // Active notifications are candidates on the same automatic basis.
    for (const n of notifications) {
      const expiry = toDate(n.validTillDate);
      if (isExpired(expiry)) continue;
      candidates.push({
        id: `notice-${n.id}`,
        sourceType: 'notification',
        sourceId: n.id,
        title: n.title,
        referenceNo: null,
        url: n.documentUrl || '/notifications',
        fileUrl: n.documentUrl,
        fileFormat: n.fileFormat || detectFileFormat(n.documentUrl),
        fileSizeBytes: n.fileSizeBytes ?? null,
        priority: n.priority || 'Normal',
        publishDate: toDate(n.publishDate) || now,
        closingDate: expiry,
      });
    }

    const selected: Candidate[] = [];
    const taken = new Set<string>();

    const take = (list: Candidate[]): void => {
      for (const candidate of list) {
        if (selected.length >= MAX_ITEMS) break;
        if (taken.has(candidate.id)) continue;
        taken.add(candidate.id);
        selected.push(candidate);
      }
    };

    take(candidates.filter((c) => c.priority === 'Urgent').sort(newestFirst));

    if (selected.length < MAX_ITEMS) {
      take(
        candidates
          .filter(
            (c) => {
              if (c.sourceType !== 'corrigendum') return false;
              const age = now.getTime() - c.publishDate.getTime();
              return age >= 0 && age <= CORRIGENDUM_WINDOW_MS;
            },
          )
          .sort(newestFirst),
      );
    }

    if (selected.length < MAX_ITEMS) {
      take(
        candidates
          .filter(
            (c) =>
              !!c.closingDate &&
              c.closingDate.getTime() >= now.getTime() &&
              c.closingDate.getTime() - now.getTime() <= CLOSING_SOON_WINDOW_MS,
          )
          .sort(
            (a, b) =>
              (a.closingDate ? a.closingDate.getTime() : 0) -
              (b.closingDate ? b.closingDate.getTime() : 0),
          ),
      );
    }

    if (selected.length < MAX_ITEMS) {
      take([...candidates].sort(newestFirst));
    }

    const items = selected.map((c, index) => {
      const age = now.getTime() - c.publishDate.getTime();
      return {
        id: c.id,
        sourceType: c.sourceType,
        sourceId: c.sourceId,
        title: c.title,
        referenceNo: c.referenceNo,
        url: c.url,
        fileUrl: c.fileUrl,
        fileFormat: c.fileFormat,
        fileSizeBytes: c.fileSizeBytes,
        priority: c.priority,
        publishDate: c.publishDate.toISOString(),
        closingDate: c.closingDate ? c.closingDate.toISOString() : null,
        closingSoon:
          !!c.closingDate &&
          c.closingDate.getTime() >= now.getTime() &&
          c.closingDate.getTime() - now.getTime() <= CLOSING_SOON_WINDOW_MS,
        isNew: age >= 0 && age <= NEW_WINDOW_MS,
        displayOrder: index + 1,
        isActive: true,
      };
    });

    return { speed: 'Normal', autoplay: true, duration: 4, items };
  }

  async getGallery(projectId?: string) {
    const where: any = { status: { in: ['Active', 'Archived'] } };
    if (projectId) where.projectId = projectId;
    return this.prisma.galleryItem.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }
}
