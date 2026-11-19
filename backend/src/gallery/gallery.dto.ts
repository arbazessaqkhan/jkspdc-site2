import { IsString, IsOptional, MinLength, IsInt, ValidateIf } from 'class-validator';

export class CreateGalleryItemDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  partition?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  projectId?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class UpdateGalleryItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  partition?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  projectId?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
