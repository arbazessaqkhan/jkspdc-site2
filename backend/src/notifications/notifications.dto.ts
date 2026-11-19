import { IsString, IsOptional, IsDateString, IsInt, IsBoolean, IsIn, MinLength, ValidateIf } from 'class-validator';

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
  @IsInt()
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  fileFormat?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsDateString()
  validTillDate?: string | null;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  showInTicker?: boolean;

  @IsOptional()
  @IsIn(['Normal', 'Urgent'])
  priority?: string;

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
  @IsInt()
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  fileFormat?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsDateString({}, { message: 'Valid till date must be a valid ISO date string' })
  validTillDate?: string | null;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  showInTicker?: boolean;

  @IsOptional()
  @IsIn(['Normal', 'Urgent'])
  priority?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Publish date must be a valid ISO date string' })
  publishDate?: string;
}
