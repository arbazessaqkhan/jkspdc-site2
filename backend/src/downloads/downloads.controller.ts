import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly service: DownloadsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: { title: string; category: string; fileName: string; documentUrl: string; fileSizeBytes?: number; description?: string }) {
    return this.service.create(body);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
