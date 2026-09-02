import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DignitariesService } from './dignitaries.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('dignitaries')
export class DignitariesController {
  constructor(private readonly dignitariesService: DignitariesService) {}

  @Get()
  async findAll() {
    return this.dignitariesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dignitariesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: any) {
    return this.dignitariesService.create(data);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.dignitariesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return this.dignitariesService.remove(id);
  }
}
