import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PressReleasesService } from './press-releases.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('press-releases')
export class PressReleasesController {
  constructor(private readonly pressReleasesService: PressReleasesService) {}

  @Get()
  async findAll() {
    return this.pressReleasesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pressReleasesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: any, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.pressReleasesService.create(data, user, ip, ua);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.pressReleasesService.update(id, data, user, ip, ua);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return this.pressReleasesService.remove(id, user, ip, ua);
  }
}
