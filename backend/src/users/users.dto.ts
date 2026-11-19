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

export class ResetMfaDto {
  @IsString({ message: 'Current administrator password is required for verification' })
  @MinLength(1, { message: 'Current password cannot be empty' })
  currentPassword!: string;

  @IsString({ message: 'Current administrator 6-digit TOTP code is required for verification' })
  @MinLength(6, { message: 'TOTP code must be 6 digits' })
  totpCode!: string;

  @IsString({ message: 'Administrative justification/reason is required' })
  @MinLength(3, { message: 'Reason must be at least 3 characters long' })
  reason!: string;
}
