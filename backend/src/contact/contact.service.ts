import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateContactDto } from './contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubmission(dto: CreateContactDto, ipAddress: string) {
    return this.prisma.contactSubmission.create({
      data: {
        name: dto.name,
        email: dto.email,
        message: dto.message,
        ipAddress: ipAddress,
      },
    });
  }
}
