import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';

export class CreateAgmDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsDateString({}, { message: 'Meeting date must be a valid ISO date string' })
  meetingDate!: string;

  @IsString()
  @MinLength(1, { message: 'File name is required' })
  fileName!: string;

  @IsString()
  documentUrl!: string;
}

export class UpdateAgmDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Meeting date must be a valid ISO date string' })
  meetingDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'File name cannot be empty' })
  fileName?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}
