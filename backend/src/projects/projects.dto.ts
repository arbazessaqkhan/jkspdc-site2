import { IsString, IsOptional, IsNumber, IsInt, IsDateString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name!: string;

  @IsString()
  @MinLength(1, { message: 'Type is required' })
  type!: string;

  @IsNumber({}, { message: 'Capacity (MW) must be a number' })
  capacityMw!: number;

  @IsString()
  @MinLength(1, { message: 'Status is required' })
  status!: string;

  @IsString()
  @MinLength(1, { message: 'Location is required' })
  location!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Commissioned date must be a valid ISO date string' })
  commissionedDate?: string;

  @IsOptional()
  @IsString()
  configuration?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Design energy must be a number' })
  designEnergy?: number;

  @IsOptional()
  @IsInt({ message: 'Year of commissioning must be an integer' })
  yearOfCommissioning?: number;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  basin?: string;

  @IsOptional()
  @IsString()
  salientFeatures?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Type cannot be empty' })
  type?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Capacity (MW) must be a number' })
  capacityMw?: number;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Status cannot be empty' })
  status?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Location cannot be empty' })
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Commissioned date must be a valid ISO date string' })
  commissionedDate?: string;

  @IsOptional()
  @IsString()
  configuration?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Design energy must be a number' })
  designEnergy?: number;

  @IsOptional()
  @IsInt({ message: 'Year of commissioning must be an integer' })
  yearOfCommissioning?: number;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  basin?: string;

  @IsOptional()
  @IsString()
  salientFeatures?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}
