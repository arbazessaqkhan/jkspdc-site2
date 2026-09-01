import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { FinancialsService } from './financials.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('financials')
export class FinancialsController {
  constructor(private readonly service: FinancialsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    if (category) return this.service.findByCategory(category);
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: { title: string; category: string; fiscalYear?: string; documentUrl: string; fileName: string }) {
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
