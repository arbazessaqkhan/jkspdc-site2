import { IsString, IsOptional, IsInt, IsBoolean, MinLength } from 'class-validator';

export class CreateOfficialContactDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name!: string;

  @IsString()
  @MinLength(1, { message: 'Position is required' })
  position!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  srinagarPhone?: string;

  @IsOptional()
  @IsString()
  srinagarFax?: string;

  @IsOptional()
  @IsString()
  jammuPhone?: string;

  @IsOptional()
  @IsString()
  jammuFax?: string;

  @IsOptional()
  @IsInt()
  viewOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateOfficialContactDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Position cannot be empty' })
  position?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  srinagarPhone?: string;

  @IsOptional()
  @IsString()
  srinagarFax?: string;

  @IsOptional()
  @IsString()
  jammuPhone?: string;

  @IsOptional()
  @IsString()
  jammuFax?: string;

  @IsOptional()
  @IsInt()
  viewOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
