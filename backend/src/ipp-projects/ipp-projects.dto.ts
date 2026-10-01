import { IsString, IsNumber, IsInt, IsOptional, MinLength } from 'class-validator';

export class CreateIppProjectDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name!: string;

  @IsNumber({}, { message: 'Capacity (MW) must be a number' })
  capacityMw!: number;

  @IsString()
  @MinLength(1, { message: 'Status is required' })
  status!: string;

  @IsString()
  @MinLength(1, { message: 'Location is required' })
  location!: string;

  @IsString()
  @MinLength(1, { message: 'Awarded to is required' })
  awardedTo!: string;

  @IsInt({ message: 'Phase must be an integer' })
  phase!: number;
}

export class UpdateIppProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name cannot be empty' })
  name?: string;

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
  @MinLength(1, { message: 'Awarded to cannot be empty' })
  awardedTo?: string;

  @IsOptional()
  @IsInt({ message: 'Phase must be an integer' })
  phase?: number;
}
