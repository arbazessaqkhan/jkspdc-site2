import { Query, Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContactSubOfficesService } from './contact-sub-offices.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

import { CreateContactSubOfficeDto, UpdateContactSubOfficeDto } from './contact-sub-offices.dto';

@Controller('contact-sub-offices')
export class ContactSubOfficesController {
  constructor(private readonly service: ContactSubOfficesService) {}

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
  async create(@Body() body: CreateContactSubOfficeDto) {
    return this.service.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async update(@Param('id') id: string, @Body() body: UpdateContactSubOfficeDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
