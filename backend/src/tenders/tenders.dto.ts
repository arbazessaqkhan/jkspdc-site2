import { IsString, IsOptional, IsDateString, IsInt, IsBoolean, IsIn, IsArray, ValidateNested, ValidateIf } from 'class-validator';
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
  @IsString()
  fileFormat?: string;

  @IsOptional()
  @IsBoolean()
  showInTicker?: boolean;

  @IsOptional()
  @IsIn(['Normal', 'Urgent'])
  priority?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsDateString()
  closingDate?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsDateString()
  extendedClosingDate?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
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
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsDateString()
  closingDate?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsDateString()
  bidOpeningDate?: string | null;

  @IsString()
  documentUrl!: string;

  @IsOptional()
  @IsInt()
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  fileFormat?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  showInTicker?: boolean;

  @IsOptional()
  @IsIn(['Normal', 'Urgent'])
  priority?: string;

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
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsDateString()
  closingDate?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
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
  fileFormat?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  showInTicker?: boolean;

  @IsOptional()
  @IsIn(['Normal', 'Urgent'])
  priority?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorrigendumDto)
  corrigendums?: CorrigendumDto[];
}
