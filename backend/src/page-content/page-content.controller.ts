import { Controller, Get, Put, Delete, Query, Body, UseGuards, Req } from '@nestjs/common';
import { PageContentService } from './page-content.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('page-content')
export class PageContentController {
  constructor(private readonly service: PageContentService) {}

  @Get()
  findAllOrByQuery(@Query('slug') slug?: string) {
    if (slug) {
      return this.service.findBySlug(slug);
    }
    return this.service.findAll();
  }

  @Get('*')
  findBySlugPath(@Req() req: any) {
    const slug = req.params[0] ? req.params[0].replace(/^\//, '') : '';
    if (!slug) return this.service.findAll();
    return this.service.findBySlug(slug);
  }

  @UseGuards(AuthGuard)
  @Put('*')
  upsertPath(@Req() req: any, @Body() body: { title: string; content: string; metaDesc?: string; imageUrl?: string }) {
    const slug = req.params[0] ? req.params[0].replace(/^\//, '') : '';
    return this.service.upsert(slug, body);
  }

  @UseGuards(AuthGuard)
  @Delete('*')
  deletePath(@Req() req: any) {
    const slug = req.params[0] ? req.params[0].replace(/^\//, '') : '';
    return this.service.delete(slug);
  }
}
