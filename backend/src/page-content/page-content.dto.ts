import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpsertPageContentDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  metaDesc?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
