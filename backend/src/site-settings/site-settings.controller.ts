import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

import { UpsertSiteSettingDto } from './site-settings.dto';

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':key')
  upsert(@Param('key') key: string, @Body() body: UpsertSiteSettingDto) {
    return this.service.upsert(key, body.value);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.service.delete(key);
  }
}

