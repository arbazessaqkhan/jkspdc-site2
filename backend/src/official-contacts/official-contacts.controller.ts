import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OfficialContactsService } from './official-contacts.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('official-contacts')
export class OfficialContactsController {
  constructor(private readonly service: OfficialContactsService) {}

  @Get()
  async getPublicContacts() {
    return this.service.findAllActive();
  }

  @Get('all')
  @UseGuards(AuthGuard)
  async getAllContacts() {
    return this.service.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
