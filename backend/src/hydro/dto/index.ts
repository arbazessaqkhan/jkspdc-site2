import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator';

export class ChatMessageDto {
  role!: 'user' | 'assistant';
  text!: string;
}

export class HydroChatRequestDto {
  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  currentPage?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsArray()
  history?: ChatMessageDto[];
}

export class HydroSearchRequestDto {
  @IsString()
  @MaxLength(500)
  query!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  limit?: number;
}

export class HydroFeedbackDto {
  @IsString()
  conversationId!: string;

  rating!: number; // 1 or -1

  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedbackText?: string;
}

export class HydroAdminOverrideDto {
  @IsString()
  @MaxLength(1000)
  question!: string;

  @IsString()
  answer!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  priority?: number;
}

// Response interfaces
export interface HydroChatResponse {
  reply: string;
  sources?: HydroSourceRef[];
  confidence: 'high' | 'medium' | 'low';
  conversationId?: string;
  suggestedQuestions?: string[];
}

export interface HydroSourceRef {
  title: string;
  url?: string;
  documentType?: string;
  pageNumber?: number;
  sectionRef?: string;
  relevanceScore?: number;
}

export interface HydroSearchResult {
  title: string;
  snippet: string;
  url?: string;
  documentType?: string;
  date?: string;
  relevanceScore: number;
}

export interface HydroAdminStatus {
  totalDocuments: number;
  totalChunks: number;
  totalConversations: number;
  lastIngestionAt?: string;
  lastIngestionStatus?: string;
  indexHealth: 'healthy' | 'stale' | 'empty';
  vectorIndexSize: number;
}
