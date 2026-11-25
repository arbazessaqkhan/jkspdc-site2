import { IsString, IsOptional, MinLength, IsInt, ValidateIf, IsArray, IsIn } from 'class-validator';

export const GALLERY_CATEGORIES = ['Official Events', 'Corporate', 'Projects', 'General'] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export class CreateGalleryItemDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  @IsIn(GALLERY_CATEGORIES, { message: 'Category must be one of: Official Events, Corporate, Projects, General' })
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
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(GALLERY_CATEGORIES, { message: 'Category must be one of: Official Events, Corporate, Projects, General' })
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

