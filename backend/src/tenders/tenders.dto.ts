import { IsString, IsOptional, IsDateString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CorrigendumDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsString()
  publishDate!: string;

  @IsString()
  documentUrl!: string;

  @IsInt()
  fileSizeBytes!: number;

  @IsOptional()
  @IsDateString()
  extendedClosingDate?: string | null;

  @IsOptional()
  @IsDateString()
  extendedBidOpeningDate?: string | null;
}

export class CreateTenderDto {
  @IsString()
  referenceNo!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  workCategory?: string;

  @IsOptional()
  @IsString()
  locationTag?: string;

  @IsOptional()
  @IsDateString()
  closingDate?: string | null;

  @IsOptional()
  @IsDateString()
  bidOpeningDate?: string | null;

  @IsString()
  documentUrl!: string;

  @IsOptional()
  @IsInt()
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorrigendumDto)
  corrigendums?: CorrigendumDto[];
}

export class UpdateTenderDto {
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  workCategory?: string;

  @IsOptional()
  @IsString()
  locationTag?: string;

  @IsOptional()
  @IsDateString()
  closingDate?: string | null;

  @IsOptional()
  @IsDateString()
  bidOpeningDate?: string | null;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsInt()
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorrigendumDto)
  corrigendums?: CorrigendumDto[];
}
