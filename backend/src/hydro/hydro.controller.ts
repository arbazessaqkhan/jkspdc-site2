import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { HydroService } from './services/hydro.service';
import {
  HydroChatRequestDto,
  HydroSearchRequestDto,
  HydroFeedbackDto,
} from './dto';

@Controller('hydro')
export class HydroController {
  constructor(private readonly hydroService: HydroService) {}

  /**
   * Main conversational endpoint (public, used by floating widget)
   */
  @Post('chat')
  async chat(@Body() dto: HydroChatRequestDto) {
    return this.hydroService.handleChat(dto);
  }

  /**
   * Search endpoint for natural language query retrieval
   */
  @Post('search')
  async search(@Body() dto: HydroSearchRequestDto) {
    return this.hydroService.handleSearch(dto);
  }

  /**
   * Instant autocomplete search suggestions
   */
  @Get('suggest')
  async suggest(@Body() _body: any, @Query('q') query?: string) {
    return this.hydroService.handleSuggest(query || '');
  }

  /**
   * Feedback endpoint (thumbs up / thumbs down)
   */
  @Post('feedback')
  async feedback(@Body() dto: HydroFeedbackDto) {
    return this.hydroService.handleFeedback(dto);
  }

  /**
   * Administrative status endpoint
   */
  @Get('admin/status')
  async getStatus() {
    return this.hydroService.getAdminStatus();
  }

  /**
   * Admin trigger knowledge re-indexing
   */
  @Post('admin/ingest')
  async triggerIngestion() {
    return this.hydroService.triggerIngestion();
  }
}
