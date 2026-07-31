import { Controller, Post, Body } from '@nestjs/common';
import { ChatService, ChatRequestDto } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleChat(@Body() dto: ChatRequestDto) {
    return this.chatService.handleUserMessage(dto);
  }
}
