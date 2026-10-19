import { Query, Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OfficialContactsService } from './official-contacts.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

import { CreateOfficialContactDto, UpdateOfficialContactDto } from './official-contacts.dto';

@Controller('official-contacts')
export class OfficialContactsController {
  constructor(private readonly service: OfficialContactsService) {}

  @Get()
  async getPublicContacts() {
    return this.service.findAllActive();
  }

  @Get('all')
  @UseGuards(AuthGuard)
  async getAllContacts(@Query() q: any) {
    return this.service.findAll(q);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async create(@Body() body: CreateOfficialContactDto) {
    return this.service.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async update(@Param('id') id: string, @Body() body: UpdateOfficialContactDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
