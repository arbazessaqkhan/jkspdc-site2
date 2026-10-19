import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { IppProjectsService } from './ipp-projects.service';
import { CreateIppProjectDto, UpdateIppProjectDto } from './ipp-projects.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('ipp-projects')
export class IppProjectsController {
  constructor(private readonly service: IppProjectsService) {}

  @Get()
  findAll(@Query() q: any, @Query('phase') phase?: string) {
    const phaseNum = phase ? parseInt(phase, 10) : undefined;
    return this.service.findAll(q, phaseNum);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateIppProjectDto) {
    return this.service.create(body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateIppProjectDto) {
    return this.service.update(id, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
