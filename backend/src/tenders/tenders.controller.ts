import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TendersService } from './tenders.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get()
  async findAll() {
    return this.tendersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tendersService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: any, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.tendersService.create(data, user, ip, ua);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.tendersService.update(id, data, user, ip, ua);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.tendersService.remove(id, user, ip, ua);
  }
}
