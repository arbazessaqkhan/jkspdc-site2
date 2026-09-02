import { Module } from '@nestjs/common';
import { DignitariesService } from './dignitaries.service';
import { DignitariesController } from './dignitaries.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DignitariesController],
  providers: [DignitariesService, PrismaService],
  exports: [DignitariesService],
})
export class DignitariesModule {}
