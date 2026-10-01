import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DignitariesService } from './dignitaries.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

import { CreateDignitaryDto, UpdateDignitaryDto } from './dignitaries.dto';

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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() data: CreateDignitaryDto) {
    return this.dignitariesService.create(data);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() data: UpdateDignitaryDto) {
    return this.dignitariesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.dignitariesService.remove(id);
  }
}
