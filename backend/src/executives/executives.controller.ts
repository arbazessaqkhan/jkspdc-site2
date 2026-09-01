import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ExecutivesService } from './executives.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('executives')
export class ExecutivesController {
  constructor(private readonly service: ExecutivesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: { name: string; designation: string; department?: string; phone?: string; email?: string; officeAddress?: string; sNo?: number }) {
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
