import { IsString, IsOptional, IsDateString, IsInt, MinLength } from 'class-validator';

export class CreateCareerDto {
  @IsString()
  @MinLength(1, { message: 'Advertisement number is required' })
  advertisementNo!: string;

  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString({}, { message: 'Closing date must be a valid ISO date string' })
  closingDate!: string;

  @IsString()
  documentUrl!: string;

  @IsOptional()
  @IsInt()
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateCareerDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Advertisement number cannot be empty' })
  advertisementNo?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Closing date must be a valid ISO date string' })
  closingDate?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsInt()
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
