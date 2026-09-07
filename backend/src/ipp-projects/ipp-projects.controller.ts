import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { IppProjectsService, CreateIppProjectDto, UpdateIppProjectDto } from './ipp-projects.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('ipp-projects')
export class IppProjectsController {
  constructor(private readonly service: IppProjectsService) {}

  @Get()
  findAll(@Query('phase') phase?: string) {
    const phaseNum = phase ? parseInt(phase, 10) : undefined;
    return this.service.findAll(phaseNum);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: CreateIppProjectDto) {
    return this.service.create(body);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateIppProjectDto) {
    return this.service.update(id, body);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
