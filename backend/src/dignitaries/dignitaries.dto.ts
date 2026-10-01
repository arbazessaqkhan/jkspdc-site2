import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';

export class CreateDignitaryDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name!: string;

  @IsString()
  @MinLength(1, { message: 'Position is required' })
  position!: string;

  @IsInt({ message: 'sNo must be an integer' })
  sNo!: number;

  @IsOptional()
  @IsString()
  subTitle?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  iasBatch?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  officeLocation?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  keyResponsibilities?: string;
}

export class UpdateDignitaryDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Position cannot be empty' })
  position?: string;

  @IsOptional()
  @IsInt({ message: 'sNo must be an integer' })
  sNo?: number;

  @IsOptional()
  @IsString()
  subTitle?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  iasBatch?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  officeLocation?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  keyResponsibilities?: string;
}
