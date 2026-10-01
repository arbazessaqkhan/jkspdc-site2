import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateFinancialDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsString()
  @MinLength(1, { message: 'Category is required' })
  category!: string;

  @IsOptional()
  @IsString()
  fiscalYear?: string;

  @IsString()
  documentUrl!: string;

  @IsString()
  @MinLength(1, { message: 'File name is required' })
  fileName!: string;
}

export class UpdateFinancialDto {
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
  fiscalYear?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'File name cannot be empty' })
  fileName?: string;
}
