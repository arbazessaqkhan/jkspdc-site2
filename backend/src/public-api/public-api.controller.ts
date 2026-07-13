import { Controller, Get } from '@nestjs/common';
import { PublicApiService } from './public-api.service';

@Controller('public')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('stations')
  async getStations() {
    return this.publicApiService.getPowerStations();
  }

  @Get('tenders')
  async getTenders() {
    return this.publicApiService.getActiveTenders();
  }

  @Get('careers')
  async getCareers() {
    return this.publicApiService.getActiveCareers();
  }

  @Get('news')
  async getNews() {
    return this.publicApiService.getPressReleases();
  }

  @Get('notifications')
  async getNotifications() {
    return this.publicApiService.getNotifications();
  }
}
