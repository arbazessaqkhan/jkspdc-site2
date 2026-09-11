import { Module } from '@nestjs/common';
import { ContactSubOfficesController } from './contact-sub-offices.controller';
import { ContactSubOfficesService } from './contact-sub-offices.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ContactSubOfficesController],
  providers: [ContactSubOfficesService, PrismaService],
  exports: [ContactSubOfficesService],
})
export class ContactSubOfficesModule {}
