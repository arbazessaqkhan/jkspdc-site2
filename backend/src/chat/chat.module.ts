import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { VectorStoreService } from './vector-store.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, VectorStoreService, PrismaService],
})
export class ChatModule { }
