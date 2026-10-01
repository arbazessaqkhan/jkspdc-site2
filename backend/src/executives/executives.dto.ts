import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';

export class CreateExecutiveDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name!: string;

  @IsString()
  @MinLength(1, { message: 'Designation is required' })
  designation!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  officeAddress?: string;

  @IsOptional()
  @IsInt()
  sNo?: number;
}

export class UpdateExecutiveDto {
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
  department?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  officeAddress?: string;

  @IsOptional()
  @IsInt()
  sNo?: number;
}
