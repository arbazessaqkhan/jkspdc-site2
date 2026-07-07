import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

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
      where: { status: 'Active' },
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
}
