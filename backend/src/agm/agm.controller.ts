import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AgmService } from './agm.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('agm')
export class AgmController {
  constructor(private readonly agmService: AgmService) {}

  @Get()
  async findAll() {
    return this.agmService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.agmService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: any, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.agmService.create(data, user, ip, ua);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.agmService.update(id, data, user, ip, ua);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.agmService.remove(id, user, ip, ua);
  }
}
