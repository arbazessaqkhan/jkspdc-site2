import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly service: SiteSettingsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }

  @UseGuards(AuthGuard)
  @Put(':key')
  upsert(@Param('key') key: string, @Body() body: { value: string }) {
    return this.service.upsert(key, body.value);
  }

  @UseGuards(AuthGuard)
  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.service.delete(key);
  }
}
