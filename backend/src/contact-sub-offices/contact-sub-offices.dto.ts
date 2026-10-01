import { IsString, IsOptional, IsInt, IsBoolean, MinLength } from 'class-validator';

export class CreateContactSubOfficeDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name!: string;

  @IsString()
  @MinLength(1, { message: 'Designation is required' })
  designation!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(1, { message: 'Wing is required' })
  wing!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsInt()
  viewOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateContactSubOfficeDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Designation cannot be empty' })
  designation?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Wing cannot be empty' })
  wing?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsInt()
  viewOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
