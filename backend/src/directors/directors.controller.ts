import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DirectorsService } from './directors.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('directors')
export class DirectorsController {
  constructor(private readonly directorsService: DirectorsService) {}

  @Get()
  async findAll() {
    return this.directorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.directorsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: any) {
    return this.directorsService.create(data);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.directorsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return this.directorsService.remove(id);
  }
}
