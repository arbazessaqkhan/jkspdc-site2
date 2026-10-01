import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(1, { message: 'Category is required' })
  category!: string;

  @IsString()
  documentUrl!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdatePolicyDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Category cannot be empty' })
  category?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
