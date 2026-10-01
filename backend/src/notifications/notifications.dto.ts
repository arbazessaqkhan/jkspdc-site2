import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsString()
  @MinLength(1, { message: 'File name is required' })
  fileName!: string;

  @IsString()
  documentUrl!: string;

  @IsOptional()
  @IsDateString({}, { message: 'Publish date must be a valid ISO date string' })
  publishDate?: string;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'File name cannot be empty' })
  fileName?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Publish date must be a valid ISO date string' })
  publishDate?: string;
}
