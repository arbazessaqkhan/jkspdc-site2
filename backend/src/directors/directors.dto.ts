import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';

export class CreateDirectorDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name!: string;

  @IsString()
  @MinLength(1, { message: 'Position is required' })
  position!: string;

  @IsString()
  @MinLength(1, { message: 'Role is required' })
  role!: string;

  @IsInt({ message: 'sNo must be an integer' })
  sNo!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDirectorDto {
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
  @MinLength(1, { message: 'Role cannot be empty' })
  role?: string;

  @IsOptional()
  @IsInt({ message: 'sNo must be an integer' })
  sNo?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
