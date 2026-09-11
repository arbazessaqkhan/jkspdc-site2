import { Module } from '@nestjs/common';
import { OfficialContactsController } from './official-contacts.controller';
import { OfficialContactsService } from './official-contacts.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [OfficialContactsController],
  providers: [OfficialContactsService, PrismaService],
  exports: [OfficialContactsService],
})
export class OfficialContactsModule {}
