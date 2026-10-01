import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';

export class CreateDownloadDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsString()
  @MinLength(1, { message: 'Category is required' })
  category!: string;

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
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateDownloadDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Category cannot be empty' })
  category?: string;

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
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
