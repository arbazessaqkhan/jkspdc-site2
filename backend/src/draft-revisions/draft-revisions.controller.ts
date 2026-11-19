import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { DraftRevisionsService } from './draft-revisions.service';

@Controller('draft-revisions')
@UseGuards(AuthGuard, RolesGuard)
export class DraftRevisionsController {
  constructor(private readonly service: DraftRevisionsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.EDITOR)
  async listAllDrafts() {
    return this.service.getAllDraftRevisions();
  }

  @Get(':entityType/:entityId')
  @Roles(Role.ADMIN, Role.EDITOR)
  async getDraft(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }
    const draft = await this.service.getDraftRevision(entityType, entityId);
    return draft || { exists: false };
  }

  @Post()
  @Roles(Role.ADMIN, Role.EDITOR)
  async saveDraft(
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Body('draftData') draftData: any,
  ) {
    if (!entityType || !entityId || draftData === undefined) {
      throw new BadRequestException('entityType, entityId, and draftData are required');
    }
    return this.service.saveDraftRevision(entityType, entityId, draftData);
  }

  @Delete(':entityType/:entityId')
  @Roles(Role.ADMIN, Role.EDITOR)
  async deleteDraft(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }
    return this.service.deleteDraftRevision(entityType, entityId);
  }
}

