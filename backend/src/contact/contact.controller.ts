import { Controller, Post, Body, Req, HttpCode, HttpStatus, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactDto } from './contact.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitContact(
    @Body() dto: CreateContactDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const submission = await this.contactService.createSubmission(dto, ipAddress);
    return {
      success: true,
      message: 'Your inquiry has been submitted successfully. Reference ID: ' + submission.id,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async getSubmissions() {
    return this.contactService.findAll();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteSubmission(@Param('id') id: string) {
    await this.contactService.deleteSubmission(id);
    return { success: true };
  }
}
