import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactDto } from './contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitContact(
    @Body() dto: CreateContactDto,
    @Req() req: Request,
  ) {
    // Get client IP address safely
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    
    const submission = await this.contactService.createSubmission(dto, ipAddress);
    
    return {
      success: true,
      message: 'Your inquiry has been submitted successfully. Reference ID: ' + submission.id,
    };
  }
}
