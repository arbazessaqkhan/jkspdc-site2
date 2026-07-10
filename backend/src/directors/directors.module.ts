import { Module } from '@nestjs/common';
import { DirectorsService } from './directors.service';
import { DirectorsController } from './directors.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DirectorsController],
  providers: [DirectorsService, PrismaService],
})
export class DirectorsModule {}
