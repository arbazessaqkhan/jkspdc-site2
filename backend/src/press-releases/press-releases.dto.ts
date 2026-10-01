import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreatePressReleaseDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsString()
  @MinLength(1, { message: 'Content is required' })
  content!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdatePressReleaseDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Content cannot be empty' })
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
