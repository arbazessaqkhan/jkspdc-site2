import { Query, Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TendersService } from './tenders.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { CreateTenderDto, UpdateTenderDto } from './tenders.dto';
import { Tender } from '@prisma/client';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@Controller('tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get()
  async findAll(@Query() q: any): Promise<Tender[]> {
    return this.tendersService.findAll(q);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tender> {
    return this.tendersService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() data: CreateTenderDto, @Req() req: AuthenticatedRequest): Promise<Tender> {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.tendersService.create(data, user, ip, ua);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() data: UpdateTenderDto, @Req() req: AuthenticatedRequest): Promise<Tender> {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.tendersService.update(id, data, user, ip, ua);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest): Promise<{ success: boolean }> {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.tendersService.remove(id, user, ip, ua);
  }
}
