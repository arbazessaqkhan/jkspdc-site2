import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateGalleryItemDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  partition?: string;
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
  partition?: string;
}
