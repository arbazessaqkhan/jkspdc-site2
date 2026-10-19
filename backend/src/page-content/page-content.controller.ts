import { Controller, Get, Put, Delete, Query, Body, UseGuards, Req } from '@nestjs/common';
import { PageContentService } from './page-content.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

import { UpsertPageContentDto } from './page-content.dto';

@Controller('page-content')
export class PageContentController {
  constructor(private readonly service: PageContentService) {}

  @Get()
  findAllOrByQuery(@Query() q: any, @Query('slug') slug?: string) {
    if (slug) {
      return this.service.findBySlug(slug);
    }
    return this.service.findAll(q);
  }

  @Get('*')
  findBySlugPath(@Req() req: any) {
    const slug = req.params[0] ? req.params[0].replace(/^\//, '') : '';
    if (!slug) return this.service.findAll();
    return this.service.findBySlug(slug);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('*')
  upsertPath(@Req() req: any, @Body() body: UpsertPageContentDto) {
    const slug = req.params[0] ? req.params[0].replace(/^\//, '') : '';
    return this.service.upsert(slug, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('*')
  deletePath(@Req() req: any) {
    const slug = req.params[0] ? req.params[0].replace(/^\//, '') : '';
    return this.service.delete(slug);
  }
}
