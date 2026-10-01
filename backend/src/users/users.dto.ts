import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum, MinLength } from 'class-validator';
import { Role } from '../auth/roles.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  @MinLength(1, { message: 'Name cannot be empty' })
  name!: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be one of ADMIN, EDITOR, VIEWER' })
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be one of ADMIN, EDITOR, VIEWER' })
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
